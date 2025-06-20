import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCw, Target, Home } from "lucide-react"
import Link from "next/link"

interface QuizCompleteProps {
  correctCount: number
  incorrectCount: number
  totalQuestions: number
  onReset: () => void
  onRetryIncorrect: () => void
}

export function QuizComplete({
  correctCount,
  incorrectCount,
  totalQuestions,
  onReset,
  onRetryIncorrect,
}: QuizCompleteProps) {
  const hasIncorrectAnswers = incorrectCount > 0

  return (
    <Card className="w-full max-w-2xl text-center shadow-lg animate-in fade-in zoom-in-95">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary">¡Cuestionario Completado!</CardTitle>
        <CardDescription className="text-lg">Este es tu puntaje final.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex justify-around items-center p-6 bg-secondary rounded-lg">
          <div className="text-green-600">
            <p className="text-5xl font-bold">{correctCount}</p>
            <p className="text-sm font-medium">CORRECTAS</p>
          </div>
          <div className="text-red-600">
            <p className="text-5xl font-bold">{incorrectCount}</p>
            <p className="text-sm font-medium">INCORRECTAS</p>
          </div>
        </div>
        <p className="text-muted-foreground font-medium">
          Respondiste {correctCount} de {totalQuestions} preguntas correctamente.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link href="/">
            <Button size="lg" variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Volver al Inicio
            </Button>
          </Link>
          {hasIncorrectAnswers && (
            <Button onClick={onRetryIncorrect} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Target className="mr-2 h-4 w-4" />
              Reintentar Incorrectas
            </Button>
          )}
          <Button onClick={onReset} size="lg">
            <RotateCw className="mr-2 h-4 w-4" />
            Jugar de Nuevo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
