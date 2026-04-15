-- Turma nas matérias (1 ou 2)
ALTER TABLE course_tracks ADD COLUMN turma int CHECK (turma IN (1, 2));

UPDATE course_tracks SET turma = 1 WHERE name IN ('Trindade', 'Cosmovisão Bíblica');
UPDATE course_tracks SET turma = 2 WHERE name IN ('Introdução Bíblica', 'História da Igreja');

-- Vincular aula a uma matéria + material
ALTER TABLE lessons ADD COLUMN track_id uuid REFERENCES course_tracks(id);
ALTER TABLE lessons ADD COLUMN material_url text;
ALTER TABLE lessons ADD COLUMN material_title text;
