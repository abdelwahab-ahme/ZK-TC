export interface UserProfile {
  username: string;
  avatar: string;
  points: number;
  solvedProblems: string[]; // Challenge IDs
  completedLessons: string[]; // Lesson IDs
  completedRoadmapNodes: string[]; // Node IDs
}

export interface Lesson {
  id: string;
  title: string;
  titleAr: string;
  duration: string;
  videoUrl?: string;
  youtubeId?: string;
  summary: string;
  summaryAr: string;
  quiz?: {
    question: string;
    questionAr: string;
    options: string[];
    correctIndex: number;
  };
}

export interface Course {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  lessons: Lesson[];
}

export interface SqlChallenge {
  id: string;
  title: string;
  titleAr: string;
  difficulty: "سهل" | "متوسط" | "صعب";
  difficultyEn: "Easy" | "Medium" | "Hard";
  description: string;
  descriptionAr: string;
  initialQuery: string;
  expectedQuery: string;
  hint: string;
  hintAr: string;
  pointsReward: number;
}

export interface Inquiry {
  id: string;
  title: string;
  author: string;
  content: string;
  timestamp: string;
  replies: {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    isTutor?: boolean;
  }[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  timestamp: string;
}

export interface JobPosition {
  id: string;
  title: string;
  titleAr: string;
  type: string;
  typeAr: string;
  location: string;
  locationAr: string;
  salary: string;
  description: string;
  descriptionAr: string;
  requirements: string[];
  requirementsAr: string[];
}

export interface JobApplication {
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  skills: string;
  cvSummary: string;
  status: "قيد المراجعة" | "مقبول مبدئياً" | "مكتمل";
  appliedAt: string;
}
