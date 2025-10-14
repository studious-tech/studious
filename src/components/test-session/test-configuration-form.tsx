'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Clock,
  Play,
  BookOpen,
  MessageSquare,
  PenTool,
  Headphones,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTestConfigurationStore } from '@/stores/test-session-store';
import {
  TestConfigurationForm as TestConfigFormType,
  SessionType,
  QuestionSelectionMode,
  DifficultyLevel,
} from '@/types/test-session';

// Form validation schema
const testConfigurationSchema = z.object({
  session_name: z
    .string()
    .min(1, 'Session name is required')
    .max(100, 'Session name too long'),
  session_type: z.enum(['practice', 'mock_test', 'focused_practice']),
  is_timed: z.boolean(),
  total_duration_minutes: z.number().min(1).max(600).nullable(),
  question_count: z
    .number()
    .min(1, 'At least 1 question required')
    .max(100, 'Maximum 100 questions'),
  question_selection_mode: z.enum([
    'new_only',
    'incorrect_only',
    'mixed',
    'all',
  ]),
  difficulty_levels: z
    .array(
      z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
      ])
    )
    .min(1, 'Select at least one difficulty level'),
  selected_sections: z.array(
    z.object({
      section_id: z.string(),
      section_name: z.string(),
      is_selected: z.boolean(),
      question_types: z.array(
        z.object({
          question_type_id: z.string(),
          question_type_name: z.string(),
          is_selected: z.boolean(),
          available_count: z.number(),
          difficulty_distribution: z.record(
            z.union([
              z.literal(1),
              z.literal(2),
              z.literal(3),
              z.literal(4),
              z.literal(5),
            ]),
            z.number()
          ),
          estimated_time_per_question: z.number(),
        })
      ),
      estimated_time_minutes: z.number(),
      weight: z.number(),
    })
  ),
  custom_time_limits: z.record(z.string(), z.number()),
});

interface TestConfigurationFormProps {
  examId: string;
  examName: string;
  onSubmit: (configuration: TestConfigFormType) => void;
  isLoading?: boolean;
}

const sectionIcons = {
  speaking: MessageSquare,
  writing: PenTool,
  reading: BookOpen,
  listening: Headphones,
};

const difficultyColors = {
  1: 'bg-green-100 text-green-800 border-green-200',
  2: 'bg-blue-100 text-blue-800 border-blue-200',
  3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  4: 'bg-orange-100 text-orange-800 border-orange-200',
  5: 'bg-red-100 text-red-800 border-red-200',
};

const difficultyLabels = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export function TestConfigurationForm({
  examId,
  examName,
  onSubmit,
  isLoading,
}: TestConfigurationFormProps) {
  const {
    availableQuestions,
    isLoadingAvailableQuestions,
    configuration,
    isFormValid,
    setAvailableQuestions,
    setLoadingAvailableQuestions,
    updateConfiguration,
    updateSectionSelection,
    updateQuestionTypeSelection,
    getEstimatedDuration,
    getSelectedQuestionCount,
  } = useTestConfigurationStore();

  const form = useForm<TestConfigFormType>({
    resolver: zodResolver(testConfigurationSchema),
    defaultValues: configuration,
    mode: 'onChange',
  });

  // Load available questions data
  useEffect(() => {
    const loadAvailableQuestions = async () => {
      setLoadingAvailableQuestions(true);
      try {
        const response = await fetch(`/api/exams/${examId}/test-configuration`);
        if (response.ok) {
          const data = await response.json();
          setAvailableQuestions(data);
        } else {
          console.error('Failed to load available questions');
        }
      } catch (error) {
        console.error('Error loading available questions:', error);
      } finally {
        setLoadingAvailableQuestions(false);
      }
    };

    if (examId) {
      loadAvailableQuestions();
    }
  }, [examId, setAvailableQuestions, setLoadingAvailableQuestions]);

  // Update form when configuration changes
  useEffect(() => {
    form.reset(configuration);
  }, [configuration, form]);

  const handleFormSubmit = form.handleSubmit((data) => {
    const finalConfiguration: TestConfigFormType = {
      ...data,
      selected_sections: configuration.selected_sections,
      custom_time_limits: configuration.custom_time_limits,
    };
    onSubmit(finalConfiguration);
  });

  const toggleSectionSelection = (sectionId: string, isSelected: boolean) => {
    updateSectionSelection(sectionId, { is_selected: isSelected });

    // Auto-select/deselect all question types in the section
    const section = configuration.selected_sections.find(
      (s) => s.section_id === sectionId
    );
    if (section) {
      section.question_types.forEach((qt) => {
        updateQuestionTypeSelection(sectionId, qt.question_type_id, isSelected);
      });
    }
  };

  const getSectionIcon = (sectionName: string) => {
    const iconName = sectionName.toLowerCase() as keyof typeof sectionIcons;
    const Icon = sectionIcons[iconName] || BookOpen;
    return Icon;
  };

  const selectedSectionCount = configuration.selected_sections.filter(
    (s) => s.is_selected
  ).length;
  const selectedQuestionTypeCount = configuration.selected_sections.reduce(
    (sum, s) => sum + s.question_types.filter((qt) => qt.is_selected).length,
    0
  );
  const estimatedDuration = getEstimatedDuration();
  const selectedQuestionCount = getSelectedQuestionCount();

  if (isLoadingAvailableQuestions) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading test configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!availableQuestions) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load test configuration. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Test Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Create Custom Test - {examName}
          </CardTitle>
          <CardDescription>
            Configure your personalized practice test with the sections and
            question types you want to focus on.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {selectedSectionCount}
              </div>
              <div className="text-sm text-muted-foreground">Sections</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {selectedQuestionTypeCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Question Types
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {selectedQuestionCount}
              </div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {estimatedDuration}
              </div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Session Name */}
            <div className="space-y-2">
              <Label htmlFor="session_name">Test Name</Label>
              <Controller
                name="session_name"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="session_name"
                    placeholder="e.g., Speaking & Writing Practice"
                    onChange={(e) => {
                      field.onChange(e);
                      updateConfiguration({ session_name: e.target.value });
                    }}
                  />
                )}
              />
              {form.formState.errors.session_name && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.session_name.message}
                </p>
              )}
            </div>

            {/* Session Type */}
            <div className="space-y-2">
              <Label htmlFor="session_type">Test Type</Label>
              <Controller
                name="session_type"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value: SessionType) => {
                      field.onChange(value);
                      updateConfiguration({ session_type: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="practice">Practice Session</SelectItem>
                      <SelectItem value="mock_test">Mock Test</SelectItem>
                      <SelectItem value="focused_practice">
                        Focused Practice
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <Label htmlFor="question_count">Number of Questions</Label>
              <Controller
                name="question_count"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="question_count"
                    type="number"
                    min="1"
                    max="100"
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      field.onChange(value);
                      updateConfiguration({ question_count: value });
                    }}
                  />
                )}
              />
              {form.formState.errors.question_count && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.question_count.message}
                </p>
              )}
            </div>

            {/* Question Selection Mode */}
            <div className="space-y-2">
              <Label htmlFor="question_selection_mode">
                Question Preference
              </Label>
              <Controller
                name="question_selection_mode"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value: QuestionSelectionMode) => {
                      field.onChange(value);
                      updateConfiguration({ question_selection_mode: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed Questions</SelectItem>
                      <SelectItem value="new_only">
                        New Questions Only
                      </SelectItem>
                      <SelectItem value="incorrect_only">
                        Previously Incorrect
                      </SelectItem>
                      <SelectItem value="all">All Available</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Timing Settings */}
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="is_timed"
                control={form.control}
                render={({ field }) => (
                  <Switch
                    id="is_timed"
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      updateConfiguration({ is_timed: checked });
                    }}
                  />
                )}
              />
              <Label htmlFor="is_timed" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Timed Test
              </Label>
            </div>

            {form.watch('is_timed') && (
              <div className="space-y-2">
                <Label htmlFor="total_duration_minutes">
                  Time Limit (minutes)
                </Label>
                <Controller
                  name="total_duration_minutes"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="total_duration_minutes"
                      type="number"
                      min="1"
                      max="600"
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseInt(e.target.value)
                          : null;
                        field.onChange(value);
                        updateConfiguration({ total_duration_minutes: value });
                      }}
                    />
                  )}
                />
              </div>
            )}
          </div>

          {/* Difficulty Levels */}
          <Separator />
          <div className="space-y-2">
            <Label>Difficulty Levels</Label>
            <Controller
              name="difficulty_levels"
              control={form.control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const isSelected = field.value.includes(
                      level as DifficultyLevel
                    );
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          const newLevels = isSelected
                            ? field.value.filter((l) => l !== level)
                            : [...field.value, level as DifficultyLevel];
                          field.onChange(newLevels);
                          updateConfiguration({ difficulty_levels: newLevels });
                        }}
                        className={`px-3 py-1 text-sm rounded-full border-2 transition-colors ${
                          isSelected
                            ? difficultyColors[level as DifficultyLevel]
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {difficultyLabels[level as DifficultyLevel]}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {form.formState.errors.difficulty_levels && (
              <p className="text-sm text-red-600">
                {form.formState.errors.difficulty_levels.message}
              </p>
            )}
          </div>

          {/* Additional Settings section removed - randomization and instant results not needed */}
        </CardContent>
      </Card>

      {/* Ultra Compact Section Selection - Early 2000s Style */}
      <div className="border border-gray-300 bg-gray-50 p-2">
        <div className="text-sm font-bold mb-2 text-gray-800">
          Sections & Question Types
        </div>

        {/* Table-like layout */}
        <div className="space-y-1">
          {availableQuestions.sections.map((section) => {
            const configSection = configuration.selected_sections.find(
              (s) => s.section_id === section.id
            );
            const isSelected = configSection?.is_selected || false;
            const selectedQuestionTypes =
              configSection?.question_types.filter((qt) => qt.is_selected)
                .length || 0;
            const SectionIcon = getSectionIcon(section.name);

            return (
              <div
                key={section.id}
                className={`flex items-center text-xs p-1 ${
                  isSelected ? 'bg-blue-100' : 'bg-white'
                } border border-gray-200`}
              >
                {/* Section checkbox and name */}
                <div className="flex items-center w-32 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      toggleSectionSelection(section.id, e.target.checked)
                    }
                    className="mr-1 h-3 w-3"
                  />
                  <SectionIcon className="h-3 w-3 mr-1" />
                  <span className="font-medium">{section.display_name}</span>
                </div>

                {/* Question count */}
                <div className="w-16 text-gray-600 flex-shrink-0">
                  {section.total_questions}q
                </div>

                {/* Question types - compact buttons */}
                {isSelected && (
                  <div className="flex flex-wrap gap-1 flex-1">
                    {section.question_types.map((questionType) => {
                      const isQTSelected =
                        configSection?.question_types.find(
                          (qt) => qt.question_type_id === questionType.id
                        )?.is_selected || false;

                      return (
                        <button
                          key={questionType.id}
                          type="button"
                          onClick={() =>
                            updateQuestionTypeSelection(
                              section.id,
                              questionType.id,
                              !isQTSelected
                            )
                          }
                          className={`px-1 py-0 text-xs border ${
                            isQTSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                          title={questionType.display_name}
                        >
                          {questionType.display_name
                            .split(' ')[0]
                            .substring(0, 3)}
                        </button>
                      );
                    })}
                    <span className="text-xs text-gray-500 ml-1">
                      ({selectedQuestionTypes}/{section.question_types.length})
                    </span>
                  </div>
                )}

                {!isSelected && (
                  <div className="flex-1 text-gray-400 text-xs">
                    {section.question_types.length} types available
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary bar */}
        {selectedSectionCount > 0 && (
          <div className="mt-2 p-1 bg-blue-200 border border-blue-300 text-xs flex justify-between items-center">
            <span>
              <strong>{selectedSectionCount}</strong> sections,{' '}
              <strong>{selectedQuestionTypeCount}</strong> types selected
            </span>
            <button
              type="button"
              onClick={() => {
                configuration.selected_sections.forEach((section) => {
                  toggleSectionSelection(section.section_id, false);
                });
              }}
              className="text-xs underline text-blue-800 hover:text-blue-900"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Validation & Submit */}
      <Card>
        <CardContent className="pt-6">
          {!isFormValid && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Please select at least one section and question type, and ensure
                all required fields are filled.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="min-w-[200px]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Test...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Play className="h-4 w-4" />
                  <span>Create Test</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
