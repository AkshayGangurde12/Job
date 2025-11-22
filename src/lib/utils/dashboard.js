import { format, formatDistanceToNow, parseISO } from "date-fns";

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString) => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return "Unknown time";
  }
};

/**
 * Format date to absolute format (e.g., "Jan 15, 2024 at 3:30 PM")
 */
export const formatAbsoluteTime = (dateString) => {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM dd, yyyy 'at' h:mm a");
  } catch (error) {
    return "Invalid date";
  }
};

/**
 * Get display label for difficulty level
 */
export const getDifficultyLabel = (level) => {
  const labels = {
    easy: "Easy",
    medium: "Medium",
    difficult: "Difficult",
  };
  return labels[level];
};

/**
 * Get color class for difficulty level
 */
export const getDifficultyColor = (level) => {
  const colors = {
    easy: "text-green-600 bg-green-50 border-green-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    difficult: "text-red-600 bg-red-50 border-red-200",
  };
  return colors[level];
};

/**
 * Get display text for activity type
 */
export const getActivityTypeLabel = (type) => {
  const labels = {
    resume_upload: "Resume Uploaded",
    resume_delete: "Resume Deleted",
    settings_change: "Settings Updated",
    account_created: "Account Created",
    profile_update: "Profile Updated",
    password_change: "Password Changed",
  };
  return labels[type] || "Unknown Activity";
};

/**
 * Get icon for activity type (returns Lucide icon name)
 */
export const getActivityTypeIcon = (type) => {
  const icons = {
    resume_upload: "Upload",
    resume_delete: "Trash2",
    settings_change: "Settings",
    account_created: "UserPlus",
    profile_update: "User",
    password_change: "Lock",
  };
  return icons[type] || "Activity";
};

/**
 * Get color class for activity type
 */
export const getActivityTypeColor = (type) => {
  const colors = {
    resume_upload: "text-blue-600 bg-blue-50",
    resume_delete: "text-red-600 bg-red-50",
    settings_change: "text-purple-600 bg-purple-50",
    account_created: "text-green-600 bg-green-50",
    profile_update: "text-indigo-600 bg-indigo-50",
    password_change: "text-orange-600 bg-orange-50",
  };
  return colors[type] || "text-gray-600 bg-gray-50";
};

/**
 * Get resume status display info
 */
export const getResumeStatusInfo = (status) => {
  const statusInfo = {
    active: {
      label: "Active",
      color: "text-green-600 bg-green-50 border-green-200",
      icon: "CheckCircle",
    },
    processing: {
      label: "Processing",
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      icon: "Clock",
    },
    error: {
      label: "Error",
      color: "text-red-600 bg-red-50 border-red-200",
      icon: "AlertCircle",
    },
  };
  return statusInfo[status];
};

/**
 * Generate file path for resume storage
 */
export const generateResumeFilePath = (userId, fileName) => {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${userId}/${timestamp}_${sanitizedName}`;
};

/**
 * Extract file extension from filename
 */
export const getFileExtension = (fileName) => {
  return fileName.split(".").pop()?.toLowerCase() || "";
};

/**
 * Check if file is a supported resume type
 */
export const isSupportedResumeType = (fileName) => {
  const supportedExtensions = ["pdf", "doc", "docx", "txt"];
  const extension = getFileExtension(fileName);
  return supportedExtensions.includes(extension);
};

/**
 * Truncate text to specified length with ellipsis
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

/**
 * Generate initials from name
 */
export const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Validate question count is within allowed range
 */
export const isValidQuestionCount = (count) => {
  return count >= 6 && count <= 15 && Number.isInteger(count);
};

/**
 * Get progress percentage for upload
 */
export const getUploadProgress = (loaded, total) => {
  if (total === 0) return 0;
  return Math.round((loaded / total) * 100);
};

/**
 * Debounce function for search/input handling
 */
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
