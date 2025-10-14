'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle, Eye, Code } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionOption {
  id: string;
  option_text: string;
  is_correct: boolean;
  display_order: number;
}

interface BlanksConfigEditorProps {
  questionTypeId: string;
  content: string;
  blanksConfig: any;
  options: QuestionOption[];
  onBlanksConfigChange: (config: any) => void;
  onOptionsChange?: (options: QuestionOption[]) => void;
}

export function BlanksConfigEditor({
  questionTypeId,
  content,
  blanksConfig: initialBlanksConfig,
  options,
  onBlanksConfigChange,
  onOptionsChange,
}: BlanksConfigEditorProps) {
  const [blanksConfig, setBlanksConfig] = useState<any>(
    initialBlanksConfig || { blanks: [] }
  );
  const [showPreview, setShowPreview] = useState(false);
  const [showJson, setShowJson] = useState(false);

  // Detect blanks type from question type ID
  const blanksType = questionTypeId.includes('fib-dropdown')
    ? 'dropdown'
    : questionTypeId.includes('fib-dragdrop')
    ? 'dragdrop'
    : questionTypeId.includes('fib-typing')
    ? 'typing'
    : null;

  // Detect blanks in content
  const detectBlanks = () => {
    const blankRegex = /\{\{(blank_\d+)\}\}/g;
    const matches = Array.from(content.matchAll(blankRegex));
    return matches.map((match) => ({
      id: match[1],
      position: match.index,
    }));
  };

  const detectedBlanks = detectBlanks();

  // Initialize blanks config when content changes
  useEffect(() => {
    if (detectedBlanks.length > 0 && blanksConfig.blanks.length === 0) {
      const newBlanks = detectedBlanks.map((blank) => {
        if (blanksType === 'dropdown') {
          return {
            id: blank.id,
            position: blank.position,
            options_ids: [],
            correct_option_id: '',
          };
        } else if (blanksType === 'dragdrop') {
          return {
            id: blank.id,
            position: blank.position,
            correct_answer: '',
          };
        } else if (blanksType === 'typing') {
          return {
            id: blank.id,
            position: blank.position,
            correct_answer: '',
            accept_variants: [],
            case_sensitive: false,
            max_length: 50,
          };
        }
        return null;
      }).filter(Boolean);

      const newConfig = {
        type: `fib_${blanksType}`,
        blanks: newBlanks,
        ...(blanksType === 'dragdrop' && { word_bank: [] }),
        ...(blanksType === 'typing' && { max_plays: 2 }),
      };

      setBlanksConfig(newConfig);
      onBlanksConfigChange(newConfig);
    }
  }, [detectedBlanks.length, blanksType]);

  // Update blank field
  const updateBlank = (blankIndex: number, field: string, value: any) => {
    const newBlanks = [...blanksConfig.blanks];
    newBlanks[blankIndex] = { ...newBlanks[blankIndex], [field]: value };

    const newConfig = { ...blanksConfig, blanks: newBlanks };
    setBlanksConfig(newConfig);
    onBlanksConfigChange(newConfig);
  };

  // Add option to dropdown blank
  const addOptionToBlank = (blankIndex: number, optionId: string) => {
    const blank = blanksConfig.blanks[blankIndex];
    const optionsIds = blank.options_ids || [];

    if (optionsIds.includes(optionId)) {
      toast.error('Option already added to this blank');
      return;
    }

    updateBlank(blankIndex, 'options_ids', [...optionsIds, optionId]);
  };

  // Remove option from dropdown blank
  const removeOptionFromBlank = (blankIndex: number, optionId: string) => {
    const blank = blanksConfig.blanks[blankIndex];
    const optionsIds = (blank.options_ids || []).filter((id: string) => id !== optionId);
    updateBlank(blankIndex, 'options_ids', optionsIds);
  };

  // Add word to word bank
  const addWordToBank = (word: string) => {
    const wordBank = blanksConfig.word_bank || [];
    if (wordBank.includes(word)) {
      toast.error('Word already in bank');
      return;
    }

    const newConfig = {
      ...blanksConfig,
      word_bank: [...wordBank, word],
    };
    setBlanksConfig(newConfig);
    onBlanksConfigChange(newConfig);
  };

  // Remove word from word bank
  const removeWordFromBank = (word: string) => {
    const wordBank = (blanksConfig.word_bank || []).filter((w: string) => w !== word);
    const newConfig = { ...blanksConfig, word_bank: wordBank };
    setBlanksConfig(newConfig);
    onBlanksConfigChange(newConfig);
  };

  // Add variant to typing blank
  const addVariant = (blankIndex: number, variant: string) => {
    const blank = blanksConfig.blanks[blankIndex];
    const variants = blank.accept_variants || [];

    if (variants.includes(variant)) {
      toast.error('Variant already added');
      return;
    }

    updateBlank(blankIndex, 'accept_variants', [...variants, variant]);
  };

  // Remove variant from typing blank
  const removeVariant = (blankIndex: number, variant: string) => {
    const blank = blanksConfig.blanks[blankIndex];
    const variants = (blank.accept_variants || []).filter((v: string) => v !== variant);
    updateBlank(blankIndex, 'accept_variants', variants);
  };

  // Render preview
  const renderPreview = () => {
    let previewContent = content;

    blanksConfig.blanks.forEach((blank: any) => {
      const regex = new RegExp(`\\{\\{${blank.id}\\}\\}`, 'g');

      if (blanksType === 'dropdown') {
        const selectedOption = options.find((opt) => opt.id === blank.correct_option_id);
        const replacement = selectedOption
          ? `<span class="inline-block px-3 py-1 mx-1 bg-blue-100 text-blue-900 rounded border border-blue-300 font-medium">${selectedOption.option_text}</span>`
          : `<span class="inline-block px-3 py-1 mx-1 bg-gray-100 text-gray-500 rounded border border-dashed border-gray-300">[Select...]</span>`;
        previewContent = previewContent.replace(regex, replacement);
      } else if (blanksType === 'dragdrop') {
        const replacement = blank.correct_answer
          ? `<span class="inline-block px-3 py-1 mx-1 bg-green-100 text-green-900 rounded border border-green-300 font-medium">${blank.correct_answer}</span>`
          : `<span class="inline-block px-3 py-1 mx-1 bg-gray-100 text-gray-500 rounded border border-dashed border-gray-300">[Drag here]</span>`;
        previewContent = previewContent.replace(regex, replacement);
      } else if (blanksType === 'typing') {
        const replacement = blank.correct_answer
          ? `<span class="inline-block px-3 py-1 mx-1 bg-purple-100 text-purple-900 rounded border border-purple-300 font-medium">${blank.correct_answer}</span>`
          : `<span class="inline-block px-3 py-1 mx-1 bg-gray-100 text-gray-500 rounded border border-dashed border-gray-300">[Type here]</span>`;
        previewContent = previewContent.replace(regex, replacement);
      }
    });

    return <div dangerouslySetInnerHTML={{ __html: previewContent }} className="text-base leading-relaxed" />;
  };

  if (!blanksType) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blanks Configuration</CardTitle>
          <CardDescription>
            This question type does not support blanks configuration
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Blanks Configuration</CardTitle>
          <CardDescription>
            Configure fill-in-the-blanks settings. Use{' '}
            <code className="px-2 py-1 bg-gray-100 rounded text-sm">
              {'{{blank_1}}'}, {'{{blank_2}}'}, etc.
            </code>{' '}
            in your content to mark blank positions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowJson(!showJson)}
            >
              <Code className="h-4 w-4 mr-2" />
              {showJson ? 'Hide' : 'Show'} JSON
            </Button>
            <Badge variant="secondary">
              {detectedBlanks.length} blank{detectedBlanks.length !== 1 ? 's' : ''} detected
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded border">{renderPreview()}</div>
          </CardContent>
        </Card>
      )}

      {/* JSON View */}
      {showJson && (
        <Card>
          <CardHeader>
            <CardTitle>JSON Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={JSON.stringify(blanksConfig, null, 2)}
              readOnly
              rows={15}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Configuration for each blank */}
      {detectedBlanks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Blank Settings</CardTitle>
            <CardDescription>Configure each blank detected in the content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {blanksConfig.blanks.map((blank: any, index: number) => (
              <div key={blank.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {blank.id}
                  </Badge>
                  <span className="text-sm text-gray-500">Position: {blank.position}</span>
                </div>

                {/* Dropdown type */}
                {blanksType === 'dropdown' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <Select
                        value={blank.correct_option_id || ''}
                        onValueChange={(value) =>
                          updateBlank(index, 'correct_option_id', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct option..." />
                        </SelectTrigger>
                        <SelectContent>
                          {options
                            .filter((opt) =>
                              (blank.options_ids || []).includes(opt.id)
                            )
                            .map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                {opt.option_text}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Options for this blank</Label>
                      <div className="flex flex-wrap gap-2">
                        {(blank.options_ids || []).map((optId: string) => {
                          const option = options.find((opt) => opt.id === optId);
                          return option ? (
                            <Badge
                              key={optId}
                              variant={
                                blank.correct_option_id === optId
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="flex items-center gap-2"
                            >
                              {option.option_text}
                              <button
                                type="button"
                                onClick={() => removeOptionFromBlank(index, optId)}
                                className="hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                      <Select
                        onValueChange={(value) => addOptionToBlank(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add option..." />
                        </SelectTrigger>
                        <SelectContent>
                          {options
                            .filter((opt) => !(blank.options_ids || []).includes(opt.id))
                            .map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                {opt.option_text}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Drag & Drop type */}
                {blanksType === 'dragdrop' && (
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Input
                      value={blank.correct_answer || ''}
                      onChange={(e) =>
                        updateBlank(index, 'correct_answer', e.target.value)
                      }
                      placeholder="Enter the correct word/phrase"
                    />
                  </div>
                )}

                {/* Typing type */}
                {blanksType === 'typing' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <Input
                        value={blank.correct_answer || ''}
                        onChange={(e) =>
                          updateBlank(index, 'correct_answer', e.target.value)
                        }
                        placeholder="Enter the correct word/phrase"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Accept Variants (optional)</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(blank.accept_variants || []).map((variant: string) => (
                          <Badge
                            key={variant}
                            variant="secondary"
                            className="flex items-center gap-2"
                          >
                            {variant}
                            <button
                              type="button"
                              onClick={() => removeVariant(index, variant)}
                              className="hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add acceptable variant"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const value = e.currentTarget.value.trim();
                              if (value) {
                                addVariant(index, value);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Press Enter to add. Variants are alternative acceptable answers.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Maximum Length</Label>
                        <Input
                          type="number"
                          value={blank.max_length || 50}
                          onChange={(e) =>
                            updateBlank(index, 'max_length', parseInt(e.target.value))
                          }
                          min={1}
                          max={200}
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label className="text-sm">Case Sensitive</Label>
                        <Switch
                          checked={blank.case_sensitive || false}
                          onCheckedChange={(checked) =>
                            updateBlank(index, 'case_sensitive', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Word Bank (for Drag & Drop) */}
      {blanksType === 'dragdrop' && (
        <Card>
          <CardHeader>
            <CardTitle>Word Bank</CardTitle>
            <CardDescription>
              Add words to the word bank. Include all correct answers plus distractors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(blanksConfig.word_bank || []).map((word: string) => (
                <Badge
                  key={word}
                  variant="outline"
                  className="flex items-center gap-2 text-base py-1.5 px-3"
                >
                  {word}
                  <button
                    type="button"
                    onClick={() => removeWordFromBank(word)}
                    className="hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter word and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      addWordToBank(value);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Auto-add correct answers
                  blanksConfig.blanks.forEach((blank: any) => {
                    if (blank.correct_answer) {
                      addWordToBank(blank.correct_answer);
                    }
                  });
                }}
              >
                Auto-add Correct Answers
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Word bank should contain all correct answers plus additional distractor words.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Global Settings */}
      {blanksType === 'typing' && (
        <Card>
          <CardHeader>
            <CardTitle>Audio Settings</CardTitle>
            <CardDescription>Configure audio playback limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Maximum Plays (0 = unlimited)</Label>
              <Input
                type="number"
                value={blanksConfig.max_plays || 2}
                onChange={(e) => {
                  const newConfig = {
                    ...blanksConfig,
                    max_plays: parseInt(e.target.value) || 2,
                  };
                  setBlanksConfig(newConfig);
                  onBlanksConfigChange(newConfig);
                }}
                min={0}
                max={10}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {detectedBlanks.length === 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-900 font-medium">No blanks detected</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Add blank markers like <code>{'{{blank_1}}'}</code> to your content
                  to configure fill-in-the-blanks questions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
