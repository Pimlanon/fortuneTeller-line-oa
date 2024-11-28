INSERT INTO tb_fortune_tellers (name, specialty, created_at, updated_at)
VALUES 
('kuromi', 'Tarot', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mymelodi', 'Thai Number', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('kitty', 'Astrology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('badbadz', 'Tarot', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cinnamon', 'Tea', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tb_work_days (fortune_teller_id, day_of_week, start_date, end_date, start_time, end_time, created_at, updated_at)
VALUES 
(1, 'Monday', '2024-12-25', '2024-12-25', '09:00:00', '10:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Monday', '2024-12-25', '2024-12-25', '10:00:00', '11:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Tuesday', '2024-12-26', '2024-12-26', '10:00:00', '11:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Tuesday', '2024-12-26', '2024-12-26', '11:00:00', '12:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Wednesday', '2024-12-27', '2024-12-27', '13:00:00', '14:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Wednesday', '2024-12-27', '2024-12-27', '16:00:00', '17:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Thursday', '2024-12-28', '2024-12-27', '13:00:00', '14:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Thursday', '2024-12-28', '2024-12-27', '16:00:00', '17:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Friday', '2024-12-29', '2024-12-29', '15:00:00', '16:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tb_tarot_cards (name, description, created_at, updated_at)
VALUES 
('The Fool', 'A new journey, a leap of faith.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Lovers', 'A relationship or choice between two paths.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Empress', 'Abundance, nurturing, and creativity.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Tower', 'Sudden change, upheaval, and awakening.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Sun', 'Happiness, vitality, and success.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Magician', 'Manifestation, resourcefulness, and power.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The High Priestess', 'Intuition, unconscious knowledge, and mystery.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Chariot', 'Determination, control, and victory over obstacles.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Justice', 'Fairness, truth, and balance in decisions.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Star', 'Hope, inspiration, and spiritual guidance.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);