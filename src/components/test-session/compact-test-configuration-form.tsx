'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, AlertCircle } from 'lucide-react';
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
  selected_sections: z.array(z.any()),
  custom_time_limits: z.record(z.string(), z.number()),
});

interface CompactTestConfigurationFormProps {
  examId: string;
  examName: string;
  onSubmit: (configuration: TestConfigFormType) => void;
  isLoading?: boolean;
}

// Section Tabs Component
/* eslint-disable @typescript-eslint/no-explicit-any */
function SectionTabs({
  sections,
  configuration,
  toggleSectionSelection,
  updateQuestionTypeSelection,
}: {
  sections: any[];
  configuration: any;
  toggleSectionSelection: (sectionId: string, isSelected: boolean) => void;
  updateQuestionTypeSelection: (
    sectionId: string,
    questionTypeId: string,
    isSelected: boolean
  ) => void;
}) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  return (
    <div>
      {/* Modern Section Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {sections.map((section) => {
          const configSection = configuration.selected_sections.find(
            (s: any) => s.section_id === section.id
          );
          const isSelected = configSection?.is_selected || false;
          const selectedQuestionTypes =
            configSection?.question_types.filter((qt: any) => qt.is_selected)
              .length || 0;
          const isExpanded = expandedSections.has(section.id);

          return (
            <div key={section.id} className="space-y-2">
              {/* Section Header Card */}
              <div
                className={`rounded-lg border bg-card text-card-foreground shadow-sm transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:shadow-md'
                }`}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          toggleSectionSelection(section.id, e.target.checked)
                        }
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="font-medium text-sm">
                        {section.display_name}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isSelected
                        ? `${selectedQuestionTypes}/${section.question_types.length}`
                        : `${section.total_questions}q`}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newExpanded = new Set(expandedSections);
                      if (isExpanded) {
                        newExpanded.delete(section.id);
                      } else {
                        newExpanded.add(section.id);
                      }
                      setExpandedSections(newExpanded);
                    }}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                  >
                    <span>{section.question_types.length} question types</span>
                    <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </button>
                </div>
              </div>

              {/* Expanded Question Types */}
              {isExpanded && (
                <div className="rounded-lg border bg-card shadow-sm">
                  <div className="p-3 space-y-2">
                    {section.question_types.map((questionType: any) => {
                      const isQTSelected =
                        configSection?.question_types.find(
                          (qt: any) => qt.question_type_id === questionType.id
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
                          className={`w-full p-3 text-sm rounded-md border text-left flex items-center justify-between transition-all ${
                            isQTSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-accent hover:text-accent-foreground border-border'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                isQTSelected
                                  ? 'bg-primary-foreground border-primary-foreground'
                                  : 'border-border'
                              }`}
                            >
                              {isQTSelected && (
                                <div className="w-2 h-2 bg-primary rounded-sm"></div>
                              )}
                            </div>
                            <div className="font-medium">
                              {questionType.display_name}
                            </div>
                          </div>
                          <div className="text-xs opacity-75">
                            {questionType.total_questions}
                          </div>
                        </button>
                      );
                    })}

                    {/* Section Actions */}
                    <div className="pt-2 border-t flex justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          section.question_types.forEach((qt: any) => {
                            updateQuestionTypeSelection(
                              section.id,
                              qt.id,
                              true
                            );
                          });
                        }}
                        className="text-xs text-primary hover:text-primary/80 font-medium"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          section.question_types.forEach((qt: any) => {
                            updateQuestionTypeSelection(
                              section.id,
                              qt.id,
                              false
                            );
                          });
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CompactTestConfigurationForm({
  examId,
  examName,
  onSubmit,
  isLoading,
}: CompactTestConfigurationFormProps) {
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

  const selectedSectionCount = configuration.selected_sections.filter(
    (s) => s.is_selected
  ).length;
  const selectedQuestionTypeCount = configuration.selected_sections.reduce(
    (sum, s) => sum + s.question_types.filter((qt) => qt.is_selected).length,
    0
  );
  const estimatedDuration = getEstimatedDuration();
  const selectedQuestionCount = getSelectedQuestionCount();

  // Calculate available questions based on current selections
  const availableQuestionsFromSelections = configuration.selected_sections
    .filter((s) => s.is_selected)
    .reduce((sum, s) => {
      return (
        sum +
        s.question_types
          .filter((qt) => qt.is_selected)
          .reduce((qtSum, qt) => qtSum + (qt.available_count || 0), 0)
      );
    }, 0);

  if (isLoadingAvailableQuestions) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            <span>Loading test configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!availableQuestions) {
    return (
      <Card>
        <CardContent className="py-8">
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
    <div className="w-full space-y-4">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Header with stats */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Create Test - {examName}
                </CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <span
                    className={
                      selectedSectionCount === 0
                        ? 'text-amber-600 font-medium'
                        : ''
                    }
                  >
                    {selectedSectionCount} sections
                  </span>
                  <span
                    className={
                      selectedQuestionTypeCount === 0
                        ? 'text-amber-600 font-medium'
                        : ''
                    }
                  >
                    {selectedQuestionTypeCount} question types
                  </span>
                  <span
                    className={
                      availableQuestionsFromSelections === 0
                        ? 'text-amber-600 font-medium'
                        : 'text-green-600 font-medium'
                    }
                  >
                    {availableQuestionsFromSelections} available
                  </span>
                  <span>{selectedQuestionCount} requested</span>
                  <span>{estimatedDuration}min</span>
                </div>
              </div>
              <Button
                type="submit"
                disabled={
                  !isFormValid ||
                  isLoading ||
                  availableQuestionsFromSelections === 0
                }
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Play className="h-3 w-3" />
                    <span>Create Test</span>
                  </div>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Basic Configuration */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Session Name */}
              <div className="lg:col-span-2">
                <Label htmlFor="session_name" className="text-xs">
                  Test Name
                </Label>
                <Controller
                  name="session_name"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="session_name"
                      className="h-8"
                      placeholder="My Practice Test"
                      onChange={(e) => {
                        field.onChange(e);
                        updateConfiguration({ session_name: e.target.value });
                      }}
                    />
                  )}
                />
              </div>

              {/* Session Type */}
              <div>
                <Label htmlFor="session_type" className="text-xs">
                  Type
                </Label>
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
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="practice">Practice</SelectItem>
                        <SelectItem value="mock_test">Mock Test</SelectItem>
                        <SelectItem value="focused_practice">
                          Focused
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Question Count */}
              <div>
                <Label htmlFor="question_count" className="text-xs">
                  Questions
                </Label>
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
                      className="h-8"
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        field.onChange(value);
                        updateConfiguration({ question_count: value });
                      }}
                    />
                  )}
                />
              </div>

              {/* Question Preference */}
              <div>
                <Label htmlFor="question_selection_mode" className="text-xs">
                  Preference
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
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        <SelectItem value="new_only">New Only</SelectItem>
                        <SelectItem value="incorrect_only">
                          Incorrect
                        </SelectItem>
                        <SelectItem value="all">All</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="total_duration_minutes" className="text-xs">
                  Duration (min)
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
                      className="h-8"
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
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-4 text-sm">
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
                  <Label htmlFor="is_timed" className="text-xs">
                    Timed
                  </Label>
                </div>
              </div>

              {/* Difficulty Levels */}
              <div className="flex items-center space-x-1">
                <Label className="text-xs mr-2">Difficulty:</Label>
                <Controller
                  name="difficulty_levels"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex space-x-1">
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
                              updateConfiguration({
                                difficulty_levels: newLevels,
                              });
                            }}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                              isSelected
                                ? 'bg-gray-800 text-white border-gray-800'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section & Question Type Selection */}
        {/* Modern Section Selection */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Sections & Question Types</h3>
            <div className="flex items-center gap-3">
              {selectedSectionCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedSectionCount} sections, {selectedQuestionTypeCount}{' '}
                  types
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  if (selectedSectionCount === 0) {
                    availableQuestions.sections.forEach((section) => {
                      updateSectionSelection(section.id, { is_selected: true });
                    });
                  } else {
                    configuration.selected_sections.forEach((section) => {
                      toggleSectionSelection(section.section_id, false);
                    });
                  }
                }}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {selectedSectionCount === 0
                  ? 'Select All Sections'
                  : 'Clear All'}
              </button>
            </div>
          </div>

          {selectedSectionCount === 0 && (
            <div className="mb-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              Select at least one section to continue
            </div>
          )}

          {/* Modern Section Grid */}
          <SectionTabs
            sections={availableQuestions.sections}
            configuration={configuration}
            toggleSectionSelection={toggleSectionSelection}
            updateQuestionTypeSelection={updateQuestionTypeSelection}
          />
        </div>
      </form>
    </div>
  );
}
