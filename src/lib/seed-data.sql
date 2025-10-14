-- Sample questions for testing admin dashboard
INSERT INTO questions (id, question_type_id, title, content, instructions, difficulty_level, is_active, created_at, updated_at) VALUES
-- PTE Speaking Questions
('q_pte_read_001', 'pte-read-aloud', 'Read Aloud - Climate Change', 'Climate change is one of the most pressing issues facing humanity today. Scientists worldwide agree that immediate action is required to reduce greenhouse gas emissions and limit global temperature rise.', 'Read the text aloud clearly and naturally', 2, true, now(), now()),
('q_pte_read_002', 'pte-read-aloud', 'Read Aloud - Technology Impact', 'Artificial intelligence is revolutionizing various industries, from healthcare to transportation. Machine learning algorithms can now process vast amounts of data and make predictions with remarkable accuracy.', 'Read the text aloud clearly and naturally', 3, true, now(), now()),
('q_pte_describe_001', 'pte-describe-image', 'Describe Image - Bar Chart', 'Look at the bar chart showing sales data for different quarters', 'Describe what you see in the image in detail for 40 seconds', 3, true, now(), now()),

-- IELTS Writing Questions  
('q_ielts_task1_001', 'ielts-task1', 'Writing Task 1 - Line Graph', 'The graph shows the number of visitors to three London museums between 2000 and 2020', 'Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.', 2, true, now(), now()),
('q_ielts_task2_001', 'ielts-task2', 'Writing Task 2 - Education', 'Some people believe that university students should be required to attend classes. Others believe that going to classes should be optional for students. Discuss both views and give your opinion.', 'Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.', 4, true, now(), now()),

-- PTE Writing Questions
('q_pte_essay_001', 'pte-write-essay', 'Essay - Environmental Protection', 'Environmental protection is the responsibility of politicians, not individuals as individuals can do too little. To what extent do you agree or disagree?', 'Write a 200-300 word essay on the given topic', 4, true, now(), now()),

-- More sample questions
('q_pte_repeat_001', 'pte-repeat-sentence', 'Repeat Sentence - Daily Routine', 'Audio content about daily routine', 'Listen carefully and repeat exactly what you hear', 1, true, now(), now()),
('q_ielts_part1_001', 'ielts-part1', 'Part 1 - Hobbies', 'Tell me about your hobbies and interests', 'Answer the question naturally, as in a conversation', 2, true, now(), now()),
('q_ielts_part2_001', 'ielts-part2', 'Part 2 - Memorable Trip', 'Describe a memorable trip you took. You should say: where you went, who you went with, what you did there, and explain why it was memorable.', 'Speak for 1-2 minutes about the topic', 3, true, now(), now());

-- Sample media files (these would be uploaded via the admin interface)
INSERT INTO media (id, original_filename, file_type, mime_type, file_size, storage_path, storage_bucket, created_at) VALUES
('m_audio_001', 'pte_repeat_sentence_01.mp3', 'audio', 'audio/mpeg', 2048576, 'exam-media/pte_repeat_sentence_01.mp3', 'exam-media', now()),
('m_image_001', 'ielts_writing_task1_chart.png', 'image', 'image/png', 1024768, 'exam-media/ielts_writing_task1_chart.png', 'exam-media', now()),
('m_image_002', 'pte_describe_image_chart.jpg', 'image', 'image/jpeg', 856432, 'exam-media/pte_describe_image_chart.jpg', 'exam-media', now());

-- Link media to questions
INSERT INTO question_media (question_id, media_id, media_role, display_order) VALUES
('q_pte_repeat_001', 'm_audio_001', 'primary', 0),
('q_ielts_task1_001', 'm_image_001', 'primary', 0),
('q_pte_describe_001', 'm_image_002', 'primary', 0);