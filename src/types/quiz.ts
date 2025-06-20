export interface Question {
  id: number;
  question: string;
  options: string[];
  type: 'single' | 'multiple';
  correctAnswers: string[];
}

export interface QuizData {
  title: string;
  description: string;
  questions: Question[];
}
