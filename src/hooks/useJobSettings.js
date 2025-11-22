import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { jobSettingsSchema } from "@/lib/validations/dashboard";
import { useToast } from "@/hooks/use-toast";

export const useJobSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's job settings
  const {
    data: settings,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["jobSettings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("job_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No settings found, create default settings
          const defaultSettings = {
            user_id: user.id,
            difficulty_level: "medium",
            question_count: 10,
            preferences: {},
          };

          const { data: newData, error: insertError } = await supabase
            .from("job_settings")
            .insert(defaultSettings)
            .select()
            .single();

          if (insertError) {
            throw new Error(insertError.message);
          }

          return newData;
        }
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Validate the updates
      const validationResult = jobSettingsSchema.partial().safeParse(updates);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors
          .map((err) => err.message)
          .join(", ");
        throw new Error(`Validation error: ${errorMessage}`);
      }

      const validatedUpdates = validationResult.data;

      // Prepare update data
      const updateData = {
        ...validatedUpdates,
        updated_at: new Date().toISOString(),
      };

      // Update in database
      const { data, error } = await supabase
        .from("job_settings")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Update failed: ${error.message}`);
      }

      // Log activity
      const changes = Object.keys(validatedUpdates)
        .map((key) => {
          const oldValue = settings?.[key];
          const newValue = validatedUpdates[key];
          return `${key}: ${oldValue} → ${newValue}`;
        })
        .join(", ");

      await supabase.rpc("log_activity", {
        activity_type: "settings_change",
        description: `Updated job settings: ${changes}`,
        metadata: {
          changes: validatedUpdates,
          previous_values: settings
            ? {
                difficulty_level: settings.difficulty_level,
                question_count: settings.question_count,
                preferences: settings.preferences,
              }
            : null,
        },
      });

      return data;
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["jobSettings", user?.id],
      });

      // Snapshot previous value
      const previousSettings = queryClient.getQueryData([
        "jobSettings",
        user?.id,
      ]);

      // Optimistically update
      if (previousSettings) {
        const optimisticSettings = {
          ...previousSettings,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        queryClient.setQueryData(
          ["jobSettings", user?.id],
          optimisticSettings
        );
      }

      return { previousSettings };
    },
    onError: (error, updates, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(
          ["jobSettings", user?.id],
          context.previousSettings
        );
      }

      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      // Update cache with server response
      queryClient.setQueryData(["jobSettings", user?.id], data);

      toast({
        title: "Settings updated",
        description: "Your job preferences have been saved successfully.",
      });
    },
  });

  // Update settings function
  const updateSettings = useCallback(
    async (updates) => {
      await updateMutation.mutateAsync(updates);
    },
    [updateMutation]
  );

  return {
    settings,
    updateSettings,
    isLoading,
    isUpdating: updateMutation.isPending,
    error:
      queryError?.message || updateMutation.error?.message || null,
  };
};
