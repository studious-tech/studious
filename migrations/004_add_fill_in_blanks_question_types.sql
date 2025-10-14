-- Migration: Add Fill in the Blanks Question Types for PTE
-- Date: 2025-01-09
-- Description: Adds three new fill-in-the-blanks question types for PTE Reading and Listening

-- Fill in the Blanks - Dropdown (PTE Reading)
INSERT INTO question_types (
  id,
  section_id,
  name,
  display_name,
  description,
  input_type,
  response_type,
  scoring_method,
  time_limit_seconds,
  order_index,
  is_active,
  ui_component,
  created_at,
  updated_at
) VALUES (
  'pte-reading-fib-dropdown',
  (SELECT id FROM sections WHERE name = 'pte-reading' LIMIT 1),
  'fib-dropdown',
  'Fill in the Blanks - Dropdown',
  'You will see a text with several gaps. Choose words from a dropdown menu to fill in the gaps.',
  'dropdown_selection',
  'structured_data',
  'exact_match',
  120,
  40,
  true,
  'pte-reading-fib-dropdown',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  ui_component = EXCLUDED.ui_component,
  updated_at = now();

-- Fill in the Blanks - Drag and Drop (PTE Reading)
INSERT INTO question_types (
  id,
  section_id,
  name,
  display_name,
  description,
  input_type,
  response_type,
  scoring_method,
  time_limit_seconds,
  order_index,
  is_active,
  ui_component,
  created_at,
  updated_at
) VALUES (
  'pte-reading-fib-dragdrop',
  (SELECT id FROM sections WHERE name = 'pte-reading' LIMIT 1),
  'fib-dragdrop',
  'Fill in the Blanks - Drag and Drop',
  'The text appears on a screen with several gaps in it. Drag words from the box below to fill the gaps.',
  'drag_drop',
  'structured_data',
  'exact_match',
  120,
  41,
  true,
  'pte-reading-fib-dragdrop',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  ui_component = EXCLUDED.ui_component,
  updated_at = now();

-- Fill in the Blanks - Type In (PTE Listening)
INSERT INTO question_types (
  id,
  section_id,
  name,
  display_name,
  description,
  input_type,
  response_type,
  scoring_method,
  time_limit_seconds,
  order_index,
  is_active,
  ui_component,
  created_at,
  updated_at
) VALUES (
  'pte-listening-fib-typing',
  (SELECT id FROM sections WHERE name = 'pte-listening' LIMIT 1),
  'fib-typing',
  'Fill in the Blanks - Type In',
  'A transcript of a recording appears on the screen, with several gaps. After listening to the recording, type the missing word in each gap.',
  'text_input',
  'structured_data',
  'fuzzy_match',
  180,
  30,
  true,
  'pte-listening-fib-typing',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  ui_component = EXCLUDED.ui_component,
  updated_at = now();

-- Sample Question: Fill in the Blanks - Dropdown
INSERT INTO questions (
  id,
  question_type_id,
  title,
  content,
  instructions,
  difficulty_level,
  expected_duration_seconds,
  blanks_config,
  correct_answer,
  is_active,
  created_at,
  updated_at
) VALUES (
  'sample-fib-dropdown-001',
  'pte-reading-fib-dropdown',
  'Sample FIB Dropdown: Climate Change',
  'Climate change is one of the most {{blank_1}} challenges facing humanity today. Rising temperatures have led to {{blank_2}} ice caps and rising sea levels. Scientists {{blank_3}} that immediate action is needed to reduce carbon emissions. Many countries have {{blank_4}} to achieve carbon neutrality by 2050.',
  'Choose the most appropriate word from the dropdown menu for each blank.',
  3,
  120,
  '{
    "type": "fib_dropdown",
    "blanks": [
      {
        "id": "blank_1",
        "position": 45,
        "options_ids": ["opt1", "opt2", "opt3", "opt4"],
        "correct_option_id": "opt1"
      },
      {
        "id": "blank_2",
        "position": 124,
        "options_ids": ["opt5", "opt6", "opt7", "opt8"],
        "correct_option_id": "opt6"
      },
      {
        "id": "blank_3",
        "position": 184,
        "options_ids": ["opt9", "opt10", "opt11", "opt12"],
        "correct_option_id": "opt11"
      },
      {
        "id": "blank_4",
        "position": 262,
        "options_ids": ["opt13", "opt14", "opt15", "opt16"],
        "correct_option_id": "opt14"
      }
    ]
  }'::jsonb,
  '{
    "blank_1": "opt1",
    "blank_2": "opt6",
    "blank_3": "opt11",
    "blank_4": "opt14"
  }'::jsonb,
  true,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Sample Question Options for FIB Dropdown
-- Blank 1 options
INSERT INTO question_options (question_id, id, option_text, is_correct, display_order) VALUES
  ('sample-fib-dropdown-001', 'opt1', 'pressing', true, 0),
  ('sample-fib-dropdown-001', 'opt2', 'trivial', false, 1),
  ('sample-fib-dropdown-001', 'opt3', 'ancient', false, 2),
  ('sample-fib-dropdown-001', 'opt4', 'local', false, 3);

-- Blank 2 options
INSERT INTO question_options (question_id, id, option_text, is_correct, display_order) VALUES
  ('sample-fib-dropdown-001', 'opt5', 'growing', false, 4),
  ('sample-fib-dropdown-001', 'opt6', 'melting', true, 5),
  ('sample-fib-dropdown-001', 'opt7', 'freezing', false, 6),
  ('sample-fib-dropdown-001', 'opt8', 'expanding', false, 7);

-- Blank 3 options
INSERT INTO question_options (question_id, id, option_text, is_correct, display_order) VALUES
  ('sample-fib-dropdown-001', 'opt9', 'deny', false, 8),
  ('sample-fib-dropdown-001', 'opt10', 'question', false, 9),
  ('sample-fib-dropdown-001', 'opt11', 'warn', true, 10),
  ('sample-fib-dropdown-001', 'opt12', 'celebrate', false, 11);

-- Blank 4 options
INSERT INTO question_options (question_id, id, option_text, is_correct, display_order) VALUES
  ('sample-fib-dropdown-001', 'opt13', 'refused', false, 12),
  ('sample-fib-dropdown-001', 'opt14', 'committed', true, 13),
  ('sample-fib-dropdown-001', 'opt15', 'hesitated', false, 14),
  ('sample-fib-dropdown-001', 'opt16', 'forgotten', false, 15);

-- Sample Question: Fill in the Blanks - Drag and Drop
INSERT INTO questions (
  id,
  question_type_id,
  title,
  content,
  instructions,
  difficulty_level,
  expected_duration_seconds,
  blanks_config,
  correct_answer,
  is_active,
  created_at,
  updated_at
) VALUES (
  'sample-fib-dragdrop-001',
  'pte-reading-fib-dragdrop',
  'Sample FIB Drag Drop: Ecosystem',
  'An {{blank_1}} is a community of living organisms interacting with their environment. {{blank_2}} refers to the variety of life forms in an area. Protecting natural {{blank_3}} is essential for maintaining ecological balance. Many {{blank_4}} are currently at risk of extinction.',
  'Drag the words from the box below to fill in the gaps in the text.',
  3,
  120,
  '{
    "type": "fib_dragdrop",
    "blanks": [
      {
        "id": "blank_1",
        "position": 3,
        "correct_answer": "ecosystem"
      },
      {
        "id": "blank_2",
        "position": 83,
        "correct_answer": "Biodiversity"
      },
      {
        "id": "blank_3",
        "position": 167,
        "correct_answer": "habitats"
      },
      {
        "id": "blank_4",
        "position": 234,
        "correct_answer": "species"
      }
    ],
    "word_bank": [
      "ecosystem",
      "Biodiversity",
      "habitats",
      "species",
      "population",
      "climate",
      "resources",
      "pollution"
    ]
  }'::jsonb,
  '{
    "blank_1": "ecosystem",
    "blank_2": "Biodiversity",
    "blank_3": "habitats",
    "blank_4": "species"
  }'::jsonb,
  true,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Sample Question: Fill in the Blanks - Type In (Listening)
INSERT INTO questions (
  id,
  question_type_id,
  title,
  content,
  instructions,
  difficulty_level,
  expected_duration_seconds,
  blanks_config,
  correct_answer,
  is_active,
  created_at,
  updated_at
) VALUES (
  'sample-fib-typing-001',
  'pte-listening-fib-typing',
  'Sample FIB Typing: Weather Patterns',
  'The global {{blank_1}} has been rising steadily over the past century. Scientists study {{blank_2}} patterns to understand long-term changes. Extreme weather {{blank_3}} such as hurricanes and droughts are becoming more frequent. International {{blank_4}} is essential to address these challenges.',
  'Listen to the recording and type the missing words in each gap.',
  3,
  180,
  '{
    "type": "fib_typing",
    "blanks": [
      {
        "id": "blank_1",
        "position": 11,
        "correct_answer": "temperature",
        "accept_variants": ["temp"],
        "case_sensitive": false,
        "max_length": 50
      },
      {
        "id": "blank_2",
        "position": 101,
        "correct_answer": "climate",
        "accept_variants": ["climatic"],
        "case_sensitive": false,
        "max_length": 50
      },
      {
        "id": "blank_3",
        "position": 166,
        "correct_answer": "events",
        "accept_variants": ["phenomena"],
        "case_sensitive": false,
        "max_length": 50
      },
      {
        "id": "blank_4",
        "position": 262,
        "correct_answer": "cooperation",
        "accept_variants": ["collaboration"],
        "case_sensitive": false,
        "max_length": 50
      }
    ]
  }'::jsonb,
  '{
    "blank_1": "temperature",
    "blank_2": "climate",
    "blank_3": "events",
    "blank_4": "cooperation"
  }'::jsonb,
  true,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Verify the migration
SELECT
  id,
  name,
  display_name,
  ui_component,
  section_id
FROM question_types
WHERE id IN (
  'pte-reading-fib-dropdown',
  'pte-reading-fib-dragdrop',
  'pte-listening-fib-typing'
)
ORDER BY id;
