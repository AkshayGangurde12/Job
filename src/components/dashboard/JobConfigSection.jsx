import { useState, useEffect } from 'react';
import { Settings2, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DIFFICULTY_LEVELS, QUESTION_COUNT_RANGE } from '@/types/dashboard';
import { getDifficultyLabel, getDifficultyColor } from '@/lib/utils/dashboard';

const JobConfigSection = ({
  settings,
  onSettingsChange,
  isLoading,
  isUpdating,
  error
}) => {
  const [formData, setFormData] = useState({
    difficulty_level: 'medium',
    question_count: QUESTION_COUNT_RANGE.default
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Update form data when settings change
  useEffect(() => {
    if (settings) {
      const newFormData = {
        difficulty_level: settings.difficulty_level,
        question_count: settings.question_count
      };
      setFormData(newFormData);
      setHasChanges(false);
    }
  }, [settings]);

  const handleDifficultyChange = (value) => {
    const newFormData = {
      ...formData,
      difficulty_level: value
    };
    setFormData(newFormData);
    setHasChanges(true);
  };

  const handleQuestionCountChange = (value) => {
    const newFormData = {
      ...formData,
      question_count: value[0]
    };
    setFormData(newFormData);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await onSettingsChange(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        difficulty_level: settings.difficulty_level,
        question_count: settings.question_count
      });
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Job Configuration
          </CardTitle>
          <CardDescription>
            Configure your job preferences and interview settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Job Configuration
        </CardTitle>
        <CardDescription>
          Configure your job preferences and interview settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Difficulty Level Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Difficulty Level</Label>
          <p className="text-sm text-gray-600">
            Choose the difficulty level for your interview questions and job recommendations.
          </p>
          <RadioGroup
            value={formData.difficulty_level}
            onValueChange={handleDifficultyChange}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {DIFFICULTY_LEVELS.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={level.value}
                  id={level.value}
                  disabled={isUpdating}
                />
                <Label
                  htmlFor={level.value}
                  className={`flex-1 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.difficulty_level === level.value
                      ? getDifficultyColor(level.value)
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-medium">{level.label}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {level.value === 'easy' && 'Basic questions, entry-level positions'}
                    {level.value === 'medium' && 'Intermediate questions, mid-level positions'}
                    {level.value === 'difficult' && 'Advanced questions, senior positions'}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Question Count Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Number of Questions</Label>
            <span className="text-lg font-semibold text-primary">
              {formData.question_count}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Set the number of questions you want in your interview sessions.
          </p>
          <div className="px-3">
            <Slider
              value={[formData.question_count]}
              onValueChange={handleQuestionCountChange}
              min={QUESTION_COUNT_RANGE.min}
              max={QUESTION_COUNT_RANGE.max}
              step={1}
              disabled={isUpdating}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{QUESTION_COUNT_RANGE.min} questions</span>
              <span>{QUESTION_COUNT_RANGE.max} questions</span>
            </div>
          </div>
        </div>

        {/* Current Settings Summary */}
        {settings && !hasChanges && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Current Settings</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Difficulty:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(settings.difficulty_level)}`}>
                  {getDifficultyLabel(settings.difficulty_level)}
                </span>
              </p>
              <p>
                <span className="font-medium">Questions:</span> {settings.question_count} per session
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 pt-4 border-t">
          <p>
            💡 <strong>Tip:</strong> You can adjust these settings anytime. 
            Your preferences will be applied to future job recommendations and interview sessions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobConfigSection;
