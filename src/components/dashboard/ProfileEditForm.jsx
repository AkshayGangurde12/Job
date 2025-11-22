import { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProfileEditForm = ({ profile, onUpdate, isUpdating, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (profile) {
      const newFormData = {
        name: profile.name,
        email: profile.email
      };
      setFormData(newFormData);
      setHasChanges(false);
      setValidationErrors({});
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Check if there are changes
    const changed = profile
      ? newFormData.name !== profile.name ||
        newFormData.email !== profile.email
      : false;
    setHasChanges(changed);

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onUpdate({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase()
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email
      });
      setHasChanges(false);
      setValidationErrors({});
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-gray-500">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={isUpdating}
            className={validationErrors.name ? 'border-red-500' : ''}
            placeholder="Enter your full name"
          />
          {validationErrors.name && (
            <p className="text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={isUpdating}
            className={validationErrors.email ? 'border-red-500' : ''}
            placeholder="Enter your email address"
          />
          {validationErrors.email && (
            <p className="text-sm text-red-600">{validationErrors.email}</p>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p><strong>Account ID:</strong> {profile.id}</p>
        <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
        <p><strong>Last Updated:</strong> {new Date(profile.updated_at).toLocaleDateString()}</p>
      </div>

      {hasChanges && (
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isUpdating}
          >
            Cancel
          </Button>
        </div>
      )}

      {!hasChanges && (
        <div className="text-sm text-gray-500 pt-4 border-t">
          Make changes to your profile information above and click "Save Changes" to update.
        </div>
      )}
    </form>
  );
};

export default ProfileEditForm;
