import { useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  profileUpdateSchema,
  passwordChangeSchema,
} from "@/lib/validations/dashboard";
import { useToast } from "@/hooks/use-toast";

const ACTIVITY_PAGE_SIZE = 20;

export const useUserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch activity history with pagination
  const {
    data: activityPages,
    fetchNextPage,
    hasNextPage,
    isLoading: isActivityLoading,
    error: activityError,
  } = useInfiniteQuery({
    queryKey: ["activityHistory", user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user?.id) return { data: [] };

      const from = pageParam * ACTIVITY_PAGE_SIZE;
      const to = from + ACTIVITY_PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("activity_history")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(error.message);
      }

      const hasMore = count ? from + ACTIVITY_PAGE_SIZE < count : false;

      return {
        data: data || [],
        nextPage: hasMore ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Flatten activity history from pages
  const activityHistory =
    activityPages?.pages.flatMap((page) => page.data) || [];

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Validate updates
      const validationResult = profileUpdateSchema.safeParse(updates);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors
          .map((err) => err.message)
          .join(", ");
        throw new Error(`Validation error: ${errorMessage}`);
      }

      const validatedUpdates = validationResult.data;

      // Update profile in database
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...validatedUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Profile update failed: ${error.message}`);
      }

      // Update auth user email if changed
      if (validatedUpdates.email !== profile?.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: validatedUpdates.email,
        });

        if (authError) {
          // Rollback profile update if auth update fails
          await supabase
            .from("profiles")
            .update({ email: profile?.email })
            .eq("id", user.id);

          throw new Error(`Email update failed: ${authError.message}`);
        }
      }

      // Log activity
      const changes = Object.keys(validatedUpdates)
        .filter(
          (key) =>
            validatedUpdates[key] !==
            (profile ? profile[key] : undefined)
        )
        .map(
          (key) =>
            `${key}: ${profile ? profile[key] : undefined} → ${
              validatedUpdates[key]
            }`
        )
        .join(", ");

      if (changes) {
        await supabase.rpc("log_activity", {
          activity_type: "profile_update",
          description: `Updated profile: ${changes}`,
          metadata: {
            changes: validatedUpdates,
            previous_values: profile
              ? {
                  name: profile.name,
                  email: profile.email,
                }
              : null,
          },
        });
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["userProfile", user?.id], data);
      // Invalidate activity history to show new activity
      queryClient.invalidateQueries({
        queryKey: ["activityHistory", user?.id],
      });

      toast({
        title: "Profile updated",
        description:
          "Your profile information has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Validate password data
      const validationResult = passwordChangeSchema.safeParse(
        passwordData
      );
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors
          .map((err) => err.message)
          .join(", ");
        throw new Error(`Validation error: ${errorMessage}`);
      }

      const { current_password, new_password } = validationResult.data;

      // Verify current password by attempting to sign in
      const { error: verifyError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: current_password,
        });

      if (verifyError) {
        throw new Error("Current password is incorrect");
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: new_password,
      });

      if (updateError) {
        throw new Error(
          `Password update failed: ${updateError.message}`
        );
      }

      // Log activity
      await supabase.rpc("log_activity", {
        activity_type: "password_change",
        description: "Password changed successfully",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
    },
    onSuccess: () => {
      // Invalidate activity history to show new activity
      queryClient.invalidateQueries({
        queryKey: ["activityHistory", user?.id],
      });

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update profile function
  const updateProfile = useCallback(
    async (updates) => {
      await updateProfileMutation.mutateAsync(updates);
    },
    [updateProfileMutation]
  );

  // Change password function
  const changePassword = useCallback(
    async (passwordData) => {
      await changePasswordMutation.mutateAsync(passwordData);
    },
    [changePasswordMutation]
  );

  // Load more activity function
  const loadMoreActivity = useCallback(
    async () => {
      if (hasNextPage) {
        await fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage]
  );

  const isLoading = isProfileLoading || isActivityLoading;
  const isUpdating =
    updateProfileMutation.isPending ||
    changePasswordMutation.isPending;
  const error =
    profileError?.message ||
    activityError?.message ||
    updateProfileMutation.error?.message ||
    changePasswordMutation.error?.message ||
    null;

  return {
    profile,
    updateProfile,
    changePassword,
    activityHistory,
    loadMoreActivity,
    isLoading,
    isUpdating,
    hasMoreActivity: !!hasNextPage,
    error,
  };
};
