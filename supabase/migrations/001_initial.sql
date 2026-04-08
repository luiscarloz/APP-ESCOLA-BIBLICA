-- Escola Biblica App - Schema Inicial

-- Alunos (sync com Clerk)
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Aulas (12 semanas)
CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number int NOT NULL CHECK (week_number BETWEEN 1 AND 12),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  checkin_token text UNIQUE,
  checkin_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Presencas
CREATE TABLE attendances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  checked_in_at timestamptz DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

-- Tarefas
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  due_date date,
  created_at timestamptz DEFAULT now()
);

-- Entregas de tarefas
CREATE TABLE task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content text,
  file_url text,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(task_id, student_id)
);

-- Noticias
CREATE TABLE news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  published_at timestamptz DEFAULT now(),
  created_by text NOT NULL
);

-- Indices
CREATE INDEX idx_attendances_student ON attendances(student_id);
CREATE INDEX idx_attendances_lesson ON attendances(lesson_id);
CREATE INDEX idx_task_submissions_task ON task_submissions(task_id);
CREATE INDEX idx_task_submissions_student ON task_submissions(student_id);
CREATE INDEX idx_lessons_week ON lessons(week_number);
CREATE INDEX idx_news_published ON news(published_at DESC);

-- RLS Policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Lessons: todos podem ler
CREATE POLICY "Lessons are viewable by everyone" ON lessons
  FOR SELECT USING (true);

-- Tasks: todos podem ler
CREATE POLICY "Tasks are viewable by everyone" ON tasks
  FOR SELECT USING (true);

-- News: todos podem ler
CREATE POLICY "News is viewable by everyone" ON news
  FOR SELECT USING (true);

-- Nota: as demais policies de INSERT/UPDATE/DELETE serao controladas
-- pelo service role key no servidor (admin operations)
-- e por verificacoes no codigo da aplicacao
