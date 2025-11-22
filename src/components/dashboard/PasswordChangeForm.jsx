import { useState } from 'react';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PasswordChangeForm = ({ onChangePassword, isUpdating, error }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.current_password) {
      errors.current_password = 'Current password is required';
    }

    if (!formData.new_password) {
      errors.new_password = 'New password is required';
    } else if (formData.new_password.length < 6) {
      errors.new_password = 'New password must be at least 6 characters';
    }

    if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your new password';
    } else if (formData.new_password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onChangePassword(formData);
      // Optionally clear form on success
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setValidationErrors({});
    } catch (err) {
      console.error('Failed to change password:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Password */}
      <div className="space-y-2">
        <Label htmlFor="current_password">Current Password</Label>
        <div className="relative">
          <Input
            id="current_password"
            type={showPasswords.current ? 'text' : 'password'}
            value={formData.current_password}
            onChange={(e) => handleInputChange('current_password', e.target.value)}
            disabled={isUpdating}
            className={validationErrors.current_password ? 'border-red-500' : ''}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            tabIndex={-1}
          >
            {showPasswords.current ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {validationErrors.current_password && (
          <p className="text-xs text-red-500">
            {validationErrors.current_password}
          </p>
        )}
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="new_password">New Password</Label>
        <div className="relative">
          <Input
            id="new_password"
            type={showPasswords.new ? 'text' : 'password'}
            value={formData.new_password}
            onChange={(e) => handleInputChange('new_password', e.target.value)}
            disabled={isUpdating}
            className={validationErrors.new_password ? 'border-red-500' : ''}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            tabIndex={-1}
          >
            {showPasswords.new ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {validationErrors.new_password && (
          <p className="text-xs text-red-500">
            {validationErrors.new_password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirm_password"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={formData.confirm_password}
            onChange={(e) => handleInputChange('confirm_password', e.target.value)}
            disabled={isUpdating}
            className={validationErrors.confirm_password ? 'border-red-500' : ''}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            tabIndex={-1}
          >
            {showPasswords.confirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {validationErrors.confirm_password && (
          <p className="text-xs text-red-500">
            {validationErrors.confirm_password}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isUpdating}
        className="w-full flex items-center justify-center gap-2"
      >
        <Lock className="h-4 w-4" />
        {isUpdating ? 'Updating Password...' : 'Change Password'}
      </Button>
    </form>
  );
};

export default PasswordChangeForm;
