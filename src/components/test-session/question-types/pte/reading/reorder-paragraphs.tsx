'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';

interface Option {
  id: string | number;
  text: string;
  display_order?: number;
  is_correct?: boolean;
  media_id?: string;
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
    blanks_config: unknown;
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
    media: Array<{
      id: string;
      role: string;
      display_order: number;
      media: {
        id: string;
        filename: string;
        file_type: string;
        mime_type: string;
        url: string;
        duration_seconds?: number;
        dimensions?: unknown;
      };
    }>;
    options: Option[];
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
    response: { sequence: Array<string | null> };
    responseType: string;
  }) => void;
  onSubmit: (payload: {
    questionId: string;
    sessionQuestionId: string;
    response: { sequence: Array<string | null> };
    responseType: string;
  }) => void;
  currentResponse?: { sequence?: Array<string | null> };
}

export type PTEReadingReorderRef = {
  submit: () => void;
  getSequence: () => Array<string | null>;
};

const PTEReadingReorderParagraphs = forwardRef<PTEReadingReorderRef, Props>(
  ({ question, onResponse, onSubmit }, ref) => {
    const options = React.useMemo(
      () => question.question.options || [],
      [question.question.options]
    );

    // Initialize state - always start fresh with shuffled paragraphs
    const initializeState = () => {
      // Shuffle options in source
      const shuffled = [...options]
        .sort(() => Math.random() - 0.5)
        .map((o) => ({ id: String(o.id), text: o.text }));

      return {
        targetSlots: new Array(options.length).fill(null),
        sourceItems: shuffled,
      };
    };

    const initialState = initializeState();
    const [sourceItems, setSourceItems] = useState(initialState.sourceItems);
    const [targetSlots, setTargetSlots] = useState(initialState.targetSlots);
    const [draggedItem, setDraggedItem] = useState<{
      item: { id: string; text: string };
      fromSource: boolean;
      fromIndex: number;
    } | null>(null);

    // Expose methods to parent
    useImperativeHandle(
      ref,
      () => ({
        submit: () => {
          const sequence = targetSlots.map((s) => (s ? s.id : null));
          onResponse({
            questionId: question.question.id,
            sessionQuestionId: question.sessionQuestionId,
            response: { sequence },
            responseType: 'sequence',
          });
          onSubmit({
            questionId: question.question.id,
            sessionQuestionId: question.sessionQuestionId,
            response: { sequence },
            responseType: 'sequence',
          });
        },
        getSequence: () => targetSlots.map((s) => (s ? s.id : null)),
      }),
      [
        targetSlots,
        onResponse,
        onSubmit,
        question.question.id,
        question.sessionQuestionId,
      ]
    );

    // Drag handlers
    const handleDragStart = (
      e: React.DragEvent,
      item: { id: string; text: string },
      fromSource: boolean,
      fromIndex: number
    ) => {
      setDraggedItem({ item, fromSource, fromIndex });
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
      setDraggedItem(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    // Notify parent of sequence change
    const notifyParent = useCallback(
      (slots: Array<{ id: string; text: string } | null>) => {
        const sequence = slots.map((s) => (s ? s.id : null));
        // Use queueMicrotask to escape render phase
        queueMicrotask(() => {
          onResponse({
            questionId: question.question.id,
            sessionQuestionId: question.sessionQuestionId,
            response: { sequence },
            responseType: 'sequence',
          });
        });
      },
      [onResponse, question.question.id, question.sessionQuestionId]
    );

    const handleDropOnSource = (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (!draggedItem) return;

      if (draggedItem.fromSource) {
        // Reorder within source
        const newItems = [...sourceItems];
        const [movedItem] = newItems.splice(draggedItem.fromIndex, 1);
        newItems.splice(targetIndex, 0, movedItem);
        setSourceItems(newItems);
      } else {
        // Move from target to source
        const newTargetSlots = [...targetSlots];
        const movedItem = newTargetSlots[draggedItem.fromIndex];
        newTargetSlots[draggedItem.fromIndex] = null;

        const newSourceItems = [...sourceItems];
        newSourceItems.splice(targetIndex, 0, movedItem!);

        setTargetSlots(newTargetSlots);
        setSourceItems(newSourceItems);

        // Notify parent of the change
        notifyParent(newTargetSlots);
      }
      setDraggedItem(null);
    };

    const handleDropOnTarget = (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (!draggedItem) return;

      const newTargetSlots = [...targetSlots];
      const existingItem = newTargetSlots[targetIndex];

      if (draggedItem.fromSource) {
        // Move from source to target
        const newSourceItems = [...sourceItems];
        newSourceItems.splice(draggedItem.fromIndex, 1);

        newTargetSlots[targetIndex] = draggedItem.item;

        // If there was an existing item, move it back to source
        if (existingItem) {
          newSourceItems.push(existingItem);
        }

        setSourceItems(newSourceItems);
        setTargetSlots(newTargetSlots);

        // Notify parent of the change
        notifyParent(newTargetSlots);
      } else {
        // Move within target or swap
        if (existingItem) {
          // Swap positions
          newTargetSlots[draggedItem.fromIndex] = existingItem;
          newTargetSlots[targetIndex] = draggedItem.item;
        } else {
          // Move to empty slot
          newTargetSlots[draggedItem.fromIndex] = null;
          newTargetSlots[targetIndex] = draggedItem.item;
        }

        setTargetSlots(newTargetSlots);

        // Notify parent of the change
        notifyParent(newTargetSlots);
      }
      setDraggedItem(null);
    };

    return (
      <div className="w-full py-6">
        {/* Instructions */}
        {question.question.instructions && (
          <div className="max-w-7xl mx-auto px-6 mb-6 text-sm italic text-gray-700">
            {question.question.instructions}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 mb-6">
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Source column */}
            <div className="col-span-5">
              <div className="border border-gray-300 bg-white shadow-sm">
                <div className="bg-gray-600 text-white text-center py-3 font-semibold">
                  Source
                </div>
                <div className="p-3 min-h-[200px]">
                  {sourceItems.map((item, idx) => (
                    <div
                      key={`source-${item.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, true, idx)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnSource(e, idx)}
                      className={`flex items-start gap-3 p-4 rounded-sm mb-3 border transition-all duration-200 cursor-move select-none ${
                        draggedItem?.fromSource && draggedItem.fromIndex === idx
                          ? 'bg-gray-100 border-gray-400 shadow-lg opacity-50'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex-1 text-sm text-gray-700 leading-relaxed">
                        {item.text}
                      </div>
                      <div className="text-gray-300 select-none">≡</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Arrow indicators column - positioned in middle like real PTE */}
            <div className="col-span-1 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                {/* Left arrow */}
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
                {/* Right arrow */}
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </div>
            </div>

            {/* Target column */}
            <div className="col-span-5">
              <div className="border border-gray-300 bg-white shadow-sm">
                <div className="bg-gray-600 text-white text-center py-3 font-semibold">
                  Target
                </div>
                <div className="p-3">
                  {targetSlots.map((slot, idx) => (
                    <div
                      key={`target-${idx}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnTarget(e, idx)}
                      className={`flex items-center gap-3 p-4 mb-4 border transition-all duration-200 ${
                        draggedItem
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                      style={{ minHeight: 64 }}
                    >
                      <div className="flex-1 text-sm text-gray-700">
                        {slot ? (
                          <div
                            draggable
                            onDragStart={(e) =>
                              handleDragStart(e, slot, false, idx)
                            }
                            onDragEnd={handleDragEnd}
                            className={`p-3 rounded-sm border transition-all duration-200 cursor-move select-none ${
                              draggedItem &&
                              !draggedItem.fromSource &&
                              draggedItem.fromIndex === idx
                                ? 'bg-gray-100 border-gray-300 shadow-md opacity-50'
                                : 'bg-white border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            {slot.text}
                          </div>
                        ) : (
                          <div className="text-gray-400 italic p-3">
                            (empty)
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Up/Down arrows - positioned to the right of target like real PTE */}
            <div className="col-span-1 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-1">
                {/* Up arrow */}
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                </svg>
                {/* Down arrow */}
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.41 8.84L12 13.42l4.59-4.58L18 10l-6 6-6-6z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PTEReadingReorderParagraphs.displayName = 'PTEReadingReorderParagraphs';

export default PTEReadingReorderParagraphs;
