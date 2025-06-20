import { Progress } from '@/components/ui/progress';

interface ProgressTrackerProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
}

export function ProgressTracker({
  currentQuestionIndex,
  totalQuestions,
  correctCount,
  incorrectCount
}: ProgressTrackerProps) {
  const answeredCount = correctCount + incorrectCount;
  const progressValue = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  
  return (
    <div className="w-full space-y-3 mb-6">
      <div className="flex justify-between text-sm">
        <p className="font-medium text-muted-foreground">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </p>
        <div className="flex gap-4 font-semibold">
          <span className="text-green-600">Correct: {correctCount}</span>
          <span className="text-red-600">Incorrect: {incorrectCount}</span>
        </div>
      </div>
      <Progress value={progressValue} aria-label={`${Math.round(progressValue)}% complete`} />
    </div>
  );
}
