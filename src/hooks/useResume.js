import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { validateResumeFile, generateResumeFilePath } from "@/lib/utils/dashboard";
import { useToast } from "@/hooks/use-toast";

export const useResume = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch user's resume
  const {
    data: resume,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["resume", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No resume found, return null
          return null;
        }
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Upload resume mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Validate file
      const validation = validateResumeFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Generate file path
      const filePath = generateResumeFilePath(user.id, file.name);

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Save resume metadata to database
      const resumeData = {
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        status: "active",
      };

      const { data: dbData, error: dbError } = await supabase
        .from("resumes")
        .upsert(resumeData, { onConflict: "user_id" })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from("resumes").remove([filePath]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Log activity
      await supabase.rpc("log_activity", {
        activity_type: "resume_upload",
        description: `Uploaded resume: ${file.name}`,
        metadata: {
          file_name: file.name,
          file_size: file.size,
        },
      });

      return dbData;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["resume", user?.id], data);
      toast({
        title: "Resume uploaded successfully",
        description: `${data.file_name} has been uploaded and is ready to use.`,
      });
      setUploadProgress(0);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  // Delete resume mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !resume) {
        throw new Error("No resume to delete");
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("resumes")
        .remove([resume.file_path]);

      if (storageError) {
        console.warn("Storage deletion failed:", storageError.message);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("resumes")
        .delete()
        .eq("user_id", user.id);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Log activity
      await supabase.rpc("log_activity", {
        activity_type: "resume_delete",
        description: `Deleted resume: ${resume.file_name}`,
        metadata: {
          file_name: resume.file_name,
        },
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["resume", user?.id], null);
      toast({
        title: "Resume deleted",
        description: "Your resume has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload resume function with progress tracking
  const uploadResume = useCallback(
    async (file) => {
      setUploadProgress(0);

      // Simulate progress for better UX (Supabase doesn't give upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      try {
        await uploadMutation.mutateAsync(file);
        clearInterval(progressInterval);
        setUploadProgress(100);
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    },
    [uploadMutation]
  );

  // Delete resume function
  const deleteResume = useCallback(async () => {
    await deleteMutation.mutateAsync();
  }, [deleteMutation]);

  return {
    resume,
    uploadResume,
    deleteResume,
    isLoading,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    error:
      queryError?.message ||
      uploadMutation.error?.message ||
      deleteMutation.error?.message ||
      null,
  };
};
