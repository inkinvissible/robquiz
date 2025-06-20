"use client"

import type { Question } from "@/types/quiz"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle } from "lucide-react"

interface QuestionDisplayProps {
  question: Question
  selectedAnswers: string[]
  onAnswerSelect: (answer: string) => void
  isSubmitted: boolean
}

export function QuestionDisplay({ question, selectedAnswers, onAnswerSelect, isSubmitted }: QuestionDisplayProps) {
  const getOptionClass = (option: string) => {
    if (!isSubmitted) return ""
    const isCorrect = question.correctAnswers.includes(option)
    const isSelected = selectedAnswers.includes(option)

    if (isCorrect) return "border-green-500 bg-green-500/10 text-green-700"
    if (isSelected && !isCorrect) return "border-red-500 bg-red-500/10 text-red-700"
    return "text-muted-foreground"
  }

  const renderFeedbackIcon = (option: string) => {
    if (!isSubmitted) return null
    const isCorrect = question.correctAnswers.includes(option)
    const isSelected = selectedAnswers.includes(option)

    if (isCorrect) return <CheckCircle2 className="h-5 w-5 text-green-500" />
    if (isSelected && !isCorrect) return <XCircle className="h-5 w-5 text-red-500" />
    return <div className="h-5 w-5" /> // Placeholder for alignment
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-bold leading-tight">{question.question}</CardTitle>
        <CardDescription>
          {question.type === 'single' ? 'Selecciona una respuesta.' : 'Selecciona todas las respuestas correctas.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {question.type === 'single' ? (
          <RadioGroup
            value={selectedAnswers[0] || ""}
            onValueChange={onAnswerSelect}
            disabled={isSubmitted}
          >
            {question.options.map((option) => (
              <div
                key={option}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border p-4 transition-all",
                  getOptionClass(option)
                )}
              >
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="flex-1 cursor-pointer">{option}</Label>
                {renderFeedbackIcon(option)}
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-4">
            {question.options.map((option) => (
              <div
                key={option}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border p-4 transition-all",
                  getOptionClass(option)
                )}
              >
                <Checkbox
                  id={option}
                  checked={selectedAnswers.includes(option)}
                  onCheckedChange={() => onAnswerSelect(option)}
                  disabled={isSubmitted}
                />
                <Label htmlFor={option} className="flex-1 cursor-pointer">{option}</Label>
                {renderFeedbackIcon(option)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </>
  )
}
