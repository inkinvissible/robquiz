"use client"

import type { Question } from "@/types/quiz"
import { useQuiz } from "@/hooks/useQuiz"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuizSkeleton } from "./QuizSkeleton"
import { ProgressTracker } from "./ProgressTracker"
import { QuestionDisplay } from "./QuestionDisplay"
import { QuizComplete } from "./QuizComplete"
import { cn } from "@/lib/utils"
import { RotateCw } from "lucide-react"

interface QuizClientProps {
  allQuestions: Question[]
  quizId: string
}

export function QuizClient({ allQuestions, quizId }: QuizClientProps) {
  const { state, currentQuestion, totalQuestions, actions } = useQuiz(allQuestions, quizId)

  if (state.status === "loading" || !currentQuestion) {
    return <QuizSkeleton />
  }

  if (state.status === "completed") {
    return (
      <QuizComplete
        correctCount={state.correctCount}
        incorrectCount={state.incorrectCount}
        totalQuestions={allQuestions.length}
        onReset={actions.handleReset}
        onRetryIncorrect={actions.handleRetryIncorrect}
      />
    )
  }

  return (
    <Card className={cn("w-full max-w-2xl shadow-xl transition-transform duration-500", state.isShaking && "animate-shake")}>
      <div className="p-6">
        <ProgressTracker
          currentQuestionIndex={state.currentQuestionIndex}
          totalQuestions={totalQuestions}
          correctCount={state.correctCount}
          incorrectCount={state.incorrectCount}
        />
      </div>

      <QuestionDisplay
        question={currentQuestion}
        selectedAnswers={state.selectedAnswers}
        onAnswerSelect={actions.handleAnswerSelect}
        isSubmitted={state.isSubmitted}
      />

      <div className="flex items-center justify-between p-6 border-t mt-2">
        <Button onClick={actions.handleReset} variant="outline" size="lg">
            <RotateCw className="mr-2 h-4 w-4" />
            Reiniciar
        </Button>
        
        {state.isSubmitted ? (
          <Button onClick={actions.handleNext} size="lg" className="bg-primary">
            {state.currentQuestionIndex === totalQuestions - 1 ? "Finalizar Cuestionario" : "Siguiente Pregunta"}
          </Button>
        ) : (
          <Button
            onClick={actions.handleSubmit}
            disabled={state.selectedAnswers.length === 0}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Enviar Respuesta
          </Button>
        )}
      </div>
    </Card>
  )
}
