'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';

interface Blank {
  id: string;
  position: number;
  correct_answer: string;
}

interface BlanksConfig {
  type: string;
  blanks: Blank[];
  word_bank: string[];
}

interface QuestionData {
  question: {
    id: string;
    title: string | null;
    content: string | null;
    instructions: string | null;
    difficulty_level: number;
    expected_duration_seconds: number | null;
    correct_answer: unknown;
    blanks_config: BlanksConfig;
    question_type_id: string;
    questionType: {
      id: string;
      name: string;
      display_name: string;
      description: string | null;
      input_type: string;
      response_type: string;
      scoring_method: string;
      time_limit_seconds: number | null;
      ui_component: string;
      section: {
        id: string;
        name: string;
        display_name: string;
        exam: {
          id: string;
          name: string;
          display_name: string;
        };
      };
    };
    media: Array<any>;
    options: Array<any>;
  };
  sessionQuestionId: string;
  sequenceNumber: number;
}

interface Props {
  question: QuestionData;
  examId: string;
  onResponse: (payload: {
    questionId: string;
    sessionQuestionId: string;
    response: { answers: Record<string, string> };
    responseType: string;
  }) => void;
  onSubmit: (payload: {
    questionId: string;
    sessionQuestionId: string;
    response: { answers: Record<string, string> };
    responseType: string;
  }) => void;
  currentResponse?: { answers?: Record<string, string> };
}

export type FIBDragDropRef = {
  submit: () => void;
  getAnswers: () => Record<string, string>;
};

const FIBDragDrop = forwardRef<FIBDragDropRef, Props>(
  ({ question, onResponse, onSubmit, currentResponse }, ref) => {
    const blanksConfig = question.question.blanks_config;
    const content = question.question.content || '';

    // Initialize state - always start fresh with full word bank
    const initialWordBank = (blanksConfig?.word_bank || []).sort(
      () => Math.random() - 0.5
    ); // Shuffle

    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [wordBank, setWordBank] = useState<string[]>(initialWordBank);
    const [draggedWord, setDraggedWord] = useState<{
      word: string;
      fromBlankId?: string;
    } | null>(null);

    // Parse content and create segments with blanks
    const contentSegments = useMemo(() => {
      if (!blanksConfig?.blanks) return [{ type: 'text', content }];

      const segments: Array<{
        type: 'text' | 'blank';
        content?: string;
        blankId?: string;
      }> = [];

      let lastIndex = 0;
      const blankRegex = /\{\{(blank_\d+)\}\}/g;
      let match;

      while ((match = blankRegex.exec(content)) !== null) {
        const blankId = match[1];
        const blankStart = match.index;
        const blankEnd = blankStart + match[0].length;

        // Add text before blank
        if (blankStart > lastIndex) {
          segments.push({
            type: 'text',
            content: content.substring(lastIndex, blankStart),
          });
        }

        // Add blank
        segments.push({
          type: 'blank',
          blankId,
        });

        lastIndex = blankEnd;
      }

      // Add remaining text
      if (lastIndex < content.length) {
        segments.push({
          type: 'text',
          content: content.substring(lastIndex),
        });
      }

      return segments;
    }, [content, blanksConfig]);

    // Drag handlers for word bank
    const handleDragStartFromBank = (e: React.DragEvent, word: string) => {
      setDraggedWord({ word });
      e.dataTransfer.effectAllowed = 'move';
    };

    // Drag handlers for blanks
    const handleDragStartFromBlank = (
      e: React.DragEvent,
      blankId: string,
      word: string
    ) => {
      setDraggedWord({ word, fromBlankId: blankId });
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
      setDraggedWord(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    // Drop on blank
    const handleDropOnBlank = (e: React.DragEvent, blankId: string) => {
      e.preventDefault();
      if (!draggedWord) return;

      const newAnswers = { ...answers };
      const newWordBank = [...wordBank];

      // If dropping from word bank
      if (!draggedWord.fromBlankId) {
        // If blank already has a word, return it to word bank
        if (newAnswers[blankId]) {
          newWordBank.push(newAnswers[blankId]);
        }

        // Remove word from bank and assign to blank
        const wordIndex = newWordBank.indexOf(draggedWord.word);
        if (wordIndex > -1) {
          newWordBank.splice(wordIndex, 1);
        }
        newAnswers[blankId] = draggedWord.word;
      }
      // If dropping from another blank
      else {
        const fromBlankId = draggedWord.fromBlankId;

        // Swap words between blanks
        const tempWord = newAnswers[blankId];
        newAnswers[blankId] = draggedWord.word;

        if (tempWord) {
          newAnswers[fromBlankId] = tempWord;
        } else {
          delete newAnswers[fromBlankId];
        }
      }

      setAnswers(newAnswers);
      setWordBank(newWordBank);

      // Notify parent of changes
      if (Object.keys(newAnswers).length > 0) {
        onResponse({
          questionId: question.question.id,
          sessionQuestionId: question.sessionQuestionId,
          response: { answers: newAnswers },
          responseType: 'structured_data',
        });
      }

      setDraggedWord(null);
    };

    // Drop back on word bank
    const handleDropOnBank = (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedWord || !draggedWord.fromBlankId) return;

      const newAnswers = { ...answers };
      const newWordBank = [...wordBank, draggedWord.word];

      delete newAnswers[draggedWord.fromBlankId];

      setAnswers(newAnswers);
      setWordBank(newWordBank);

      // Notify parent of changes
      if (Object.keys(newAnswers).length > 0) {
        onResponse({
          questionId: question.question.id,
          sessionQuestionId: question.sessionQuestionId,
          response: { answers: newAnswers },
          responseType: 'structured_data',
        });
      }

      setDraggedWord(null);
    };

    // Expose methods to parent
    useImperativeHandle(
      ref,
      () => ({
        submit: () => {
          onSubmit({
            questionId: question.question.id,
            sessionQuestionId: question.sessionQuestionId,
            response: { answers },
            responseType: 'structured_data',
          });
        },
        getAnswers: () => answers,
      }),
      [answers, onSubmit, question.question.id, question.sessionQuestionId]
    );

    return (
      <div className="w-full py-6">
        {/* Instructions */}
        {question.question.instructions && (
          <div className="max-w-5xl mx-auto px-6 mb-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-900">
                {question.question.instructions}
              </p>
            </div>
          </div>
        )}

        {/* Title */}
        {question.question.title && (
          <div className="max-w-5xl mx-auto px-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {question.question.title}
            </h2>
          </div>
        )}

        {/* Content with drop zones */}
        <div className="max-w-5xl mx-auto px-6 mb-6 mt-8">
          <div className="bg-white p-0">
            <div className="text-lg leading-loose text-gray-900">
              {contentSegments.map((segment, index) => {
                if (segment.type === 'text') {
                  return (
                    <span key={`text-${index}`} className="whitespace-pre-wrap">
                      {segment.content}
                    </span>
                  );
                }

                if (segment.type === 'blank' && 'blankId' in segment) {
                  const blankId = segment.blankId!;
                  const word = answers[blankId];

                  return (
                    <span
                      key={`blank-${index}`}
                      className="inline-block mx-1 align-middle"
                    >
                      <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnBlank(e, blankId)}
                        className={`inline-flex items-center justify-center min-w-[120px] h-10 px-3 border-2 border-dashed rounded transition-colors ${
                          draggedWord
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 bg-gray-50'
                        } ${
                          word ? 'bg-white border-solid border-gray-400' : ''
                        }`}
                      >
                        {word ? (
                          <div
                            draggable
                            onDragStart={(e) =>
                              handleDragStartFromBlank(e, blankId, word)
                            }
                            onDragEnd={handleDragEnd}
                            className="px-3 py-1 bg-blue-100 text-blue-900 rounded cursor-move hover:bg-blue-200 font-medium text-sm"
                          >
                            {word}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            Drop here
                          </span>
                        )}
                      </div>
                    </span>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>

        {/* Word Bank */}
        <div className="max-w-5xl mx-auto px-6 mt-8">
          <div className="bg-gray-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-gray-800">Word Bank</h3>
              <span className="text-sm text-gray-600">
                {wordBank.length} remaining
              </span>
            </div>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDropOnBank}
              className={`flex flex-wrap gap-3 min-h-[80px] p-4 transition-colors ${
                draggedWord?.fromBlankId ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              {wordBank.length === 0 ? (
                <div className="w-full text-center py-4 text-gray-400 text-sm">
                  All words have been used
                </div>
              ) : (
                wordBank.map((word, index) => (
                  <div
                    key={`word-${index}`}
                    draggable
                    onDragStart={(e) => handleDragStartFromBank(e, word)}
                    onDragEnd={handleDragEnd}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-900 cursor-move hover:border-blue-400 hover:bg-blue-50 transition-colors text-base"
                  >
                    {word}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Answer counter */}
        <div className="max-w-5xl mx-auto px-6 mt-4">
          <div className="text-sm text-gray-600">
            Filled: {Object.keys(answers).length} /{' '}
            {blanksConfig?.blanks?.length || 0} blanks
          </div>
        </div>
      </div>
    );
  }
);

FIBDragDrop.displayName = 'FIBDragDrop';

export default FIBDragDrop;
