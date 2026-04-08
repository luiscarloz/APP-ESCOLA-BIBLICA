-- Tipos de aula (tracks)
CREATE TABLE course_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Preferencias do aluno (ordenadas por prioridade)
CREATE TABLE student_track_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES course_tracks(id) ON DELETE CASCADE,
  priority int NOT NULL CHECK (priority BETWEEN 1 AND 4),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, track_id),
  UNIQUE(student_id, priority)
);

-- Coluna pra saber se ja escolheu e se pode mudar
ALTER TABLE students ADD COLUMN preferences_set boolean DEFAULT false;
ALTER TABLE students ADD COLUMN can_change_preferences boolean DEFAULT true;

-- Inserir os 4 tracks
INSERT INTO course_tracks (name, description, icon, color) VALUES
  ('Trindade', 'Estudo aprofundado sobre a doutrina da Trindade', 'triangle', 'violet'),
  ('Cosmovisao Biblica', 'Entendendo o mundo atraves da perspectiva biblica', 'globe', 'blue'),
  ('Introducao Biblica', 'Fundamentos e panorama geral da Biblia', 'book-open', 'emerald'),
  ('Historia da Igreja', 'A trajetoria da igreja ao longo dos seculos', 'landmark', 'amber');

-- RLS
ALTER TABLE course_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_track_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course tracks are viewable by everyone" ON course_tracks
  FOR SELECT USING (true);

CREATE POLICY "Preferences are viewable by everyone" ON student_track_preferences
  FOR SELECT USING (true);

-- Indices
CREATE INDEX idx_preferences_student ON student_track_preferences(student_id);
CREATE INDEX idx_preferences_track ON student_track_preferences(track_id);
