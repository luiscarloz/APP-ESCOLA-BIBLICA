-- Adicionar senha de check-in nas aulas
ALTER TABLE lessons ADD COLUMN checkin_password text;
ALTER TABLE lessons ADD COLUMN checkin_open boolean DEFAULT false;
