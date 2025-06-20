export interface Question {
  id: number;
  question: string;
  options: string[];
  type: 'single' | 'multiple';
  correctAnswers: string[];
}
