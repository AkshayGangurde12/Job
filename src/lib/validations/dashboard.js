import { z } from "zod";
import {
  QUESTION_COUNT_RANGE,
  RESUME_FILE_TYPES,
  MAX_RESUME_SIZE,
} from "@/types/dashboard";

// Job Settings validation schema
export const jobSettingsSchema = z.object({
  difficulty_level: z.enum(["easy", "medium", "difficult"], {
    required_error: "Please select a difficulty level",
    invalid_type_error: "Invalid difficulty level",
  }),
  question_count: z
    .number({
      required_error: "Question count is required",
      invalid_type_error: "Question count must be a number",
    })
    .min(
      QUESTION_COUNT_RANGE.min,
      `Minimum ${QUESTION_COUNT_RANGE.min} questions required`
    )
    .max(
      QUESTION_COUNT_RANGE.max,
      `Maximum ${QUESTION_COUNT_RANGE.max} questions allowed`
    )
    .int("Question count must be a whole number"),
  preferences: z
    .object({
      job_types: z.array(z.string()).optional(),
      industries: z.array(z.string()).optional(),
    })
    .optional(),
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase(),
});

// Password change validation schema
export const passwordChangeSchema = z
  .object({
    current_password: z
      .string({
        required_error: "Current password is required",
      })
      .min(1, "Current password is required"),
    new_password: z
      .string({
        required_error: "New password is required",
      })
      .min(6, "New password must be at least 6 characters")
      .max(128, "New password must be less than 128 characters"),
    confirm_password: z.string({
      required_error: "Please confirm your new password",
    }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: "New password must be different from current password",
    path: ["new_password"],
  });

// Resume file validation
export const validateResumeFile = (file) => {
  // Check file size
  if (file.size > MAX_RESUME_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(
        MAX_RESUME_SIZE / (1024 * 1024)
      )}MB`,
    };
  }

  // Check file type
  if (!RESUME_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "File must be PDF, Word document, or plain text",
    };
  }

  // Check file name length
  if (file.name.length > 255) {
    return {
      isValid: false,
      error: "File name is too long",
    };
  }

  return { isValid: true };
};

// Activity history query validation
export const activityHistoryQuerySchema = z.object({
  page: z.number().min(1).default(1),
  per_page: z.number().min(1).max(100).default(20),
  activity_type: z
    .enum([
      "resume_upload",
      "resume_delete",
      "settings_change",
      "account_created",
      "profile_update",
      "password_change",
    ])
    .optional(),
});
