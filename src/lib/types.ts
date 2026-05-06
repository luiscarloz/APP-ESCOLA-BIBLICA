export interface CourseTrack {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  turma: number | null;
  created_at: string;
}

export interface Student {
  id: string;
  clerk_id: string;
  name: string;
  email: string;
  phone: string | null;
  preferences_set: boolean;
  can_change_preferences: boolean;
  created_at: string;
}

export interface TrackPreference {
  id: string;
  student_id: string;
  track_id: string;
  priority: number;
  created_at: string;
}

export interface TrackPreferenceWithTrack extends TrackPreference {
  course_tracks: Pick<CourseTrack, "name" | "color" | "icon">;
}

export interface StudentWithPreferences extends Student {
  student_track_preferences: TrackPreferenceWithTrack[];
}

export interface Lesson {
  id: string;
  week_number: number;
  title: string;
  description: string | null;
  date: string;
  checkin_token: string | null;
  checkin_expires_at: string | null;
  checkin_password: string | null;
  checkin_open: boolean;
  track_id: string | null;
  material_url: string | null;
  material_title: string | null;
  created_at: string;
}

export interface LessonWithTrack extends Lesson {
  course_tracks: Pick<CourseTrack, "name" | "color" | "icon" | "turma"> | null;
}

export interface Attendance {
  id: string;
  student_id: string;
  lesson_id: string;
  checked_in_at: string;
}

export interface Task {
  id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  student_id: string;
  content: string | null;
  file_url: string | null;
  submitted_at: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published_at: string;
  created_by: string;
}

// Extended types with joins
export interface AttendanceWithLesson extends Attendance {
  lessons: Pick<Lesson, "title" | "week_number" | "date">;
}

export interface TaskSubmissionWithStudent extends TaskSubmission {
  students: Pick<Student, "name" | "email">;
}

export interface TaskWithSubmission extends Task {
  task_submissions?: TaskSubmission[];
  lessons?: Pick<Lesson, "id" | "title" | "week_number" | "track_id"> & {
    course_tracks?: Pick<CourseTrack, "name" | "color" | "icon" | "turma"> | null;
  } | null;
}
