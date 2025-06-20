"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { Question } from "@/types/quiz"
import { useToast } from "@/hooks/use-toast"

const LOCAL_STORAGE_KEY = "cuestionario-progress"

interface QuizState {
  status: "loading" | "active" | "completed"
  activeQuestions: Question[]
  currentQuestionIndex: number
  selectedAnswers: string[]
  isSubmitted: boolean
  correctCount: number
  incorrectCount: number
  incorrectlyAnsweredIds: number[]
  isShaking: boolean
}

export function useQuiz(allQuestions: Question[]) {
  const { toast } = useToast()
  const [state, setState] = useState<QuizState>({
    status: "loading",
    activeQuestions: allQuestions,
    currentQuestionIndex: 0,
    selectedAnswers: [],
    isSubmitted: false,
    correctCount: 0,
    incorrectCount: 0,
    incorrectlyAnsweredIds: [],
    isShaking: false,
  })

  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON)
        // Ensure activeQuestions are from the latest source, not localStorage
        const activeQuestions = savedState.activeQuestions.map((savedQ: Question) => 
            allQuestions.find(q => q.id === savedQ.id)
        ).filter(Boolean) as Question[]

        if(activeQuestions.length > 0) {
            setState({ ...savedState, activeQuestions, status: savedState.status || 'active' })
        } else {
             // If saved questions don't match current, reset
            startNewQuiz(allQuestions)
        }
      } else {
        startNewQuiz(allQuestions)
      }
    } catch (error) {
      console.error("Failed to load from localStorage", error)
      startNewQuiz(allQuestions)
    }
  }, [allQuestions])

  useEffect(() => {
    if (state.status !== "loading") {
      try {
        const stateToSave = { ...state, isShaking: false }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave))
      } catch (error) {
        console.error("Failed to save to localStorage", error)
      }
    }
  }, [state])

  const startNewQuiz = useCallback((questions: Question[]) => {
    setState({
      status: "active",
      activeQuestions: questions,
      currentQuestionIndex: 0,
      selectedAnswers: [],
      isSubmitted: false,
      correctCount: 0,
      incorrectCount: 0,
      incorrectlyAnsweredIds: [],
      isShaking: false,
    })
  }, [])
  
  const handleAnswerSelect = useCallback((answer: string) => {
    if (state.isSubmitted) return

    const currentQuestion = state.activeQuestions[state.currentQuestionIndex]
    if (!currentQuestion) return

    setState(prevState => {
      let newSelectedAnswers: string[]
      if (currentQuestion.type === "single") {
        newSelectedAnswers = [answer]
      } else {
        newSelectedAnswers = prevState.selectedAnswers.includes(answer)
          ? prevState.selectedAnswers.filter(a => a !== answer)
          : [...prevState.selectedAnswers, answer]
      }
      return { ...prevState, selectedAnswers: newSelectedAnswers }
    })
  }, [state.isSubmitted, state.activeQuestions, state.currentQuestionIndex])

  const handleSubmit = useCallback(() => {
    if (state.isSubmitted || state.selectedAnswers.length === 0) return

    const currentQuestion = state.activeQuestions[state.currentQuestionIndex]
    if (!currentQuestion) return

    const correctAnswers = currentQuestion.correctAnswers
    const selected = state.selectedAnswers
    const isCorrect = correctAnswers.length === selected.length && correctAnswers.every(a => selected.includes(a))

    if (isCorrect) {
      setState(prevState => ({ ...prevState, isSubmitted: true, correctCount: prevState.correctCount + 1 }))
      toast({ title: "¡Correcto!", description: "¡Buen trabajo!", duration: 2000 })
    } else {
      setState(prevState => ({
        ...prevState,
        isSubmitted: true,
        incorrectCount: prevState.incorrectCount + 1,
        incorrectlyAnsweredIds: [...prevState.incorrectlyAnsweredIds, currentQuestion.id],
        isShaking: true,
      }))
      setTimeout(() => setState(prevState => ({...prevState, isShaking: false})), 820)
    }
  }, [state.isSubmitted, state.selectedAnswers, state.activeQuestions, state.currentQuestionIndex, toast])

  const handleNext = useCallback(() => {
    if (!state.isSubmitted) return

    const nextIndex = state.currentQuestionIndex + 1
    if (nextIndex < state.activeQuestions.length) {
      setState(prevState => ({
        ...prevState,
        currentQuestionIndex: nextIndex,
        selectedAnswers: [],
        isSubmitted: false,
      }))
    } else {
      setState(prevState => ({ ...prevState, status: "completed" }))
    }
  }, [state.isSubmitted, state.currentQuestionIndex, state.activeQuestions.length])
  
  const handleReset = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    startNewQuiz(allQuestions)
  }, [allQuestions, startNewQuiz])
  
  const handleRetryIncorrect = useCallback(() => {
    const incorrectQuestions = allQuestions.filter(q => state.incorrectlyAnsweredIds.includes(q.id))
    setState({
      status: "active",
      activeQuestions: incorrectQuestions,
      currentQuestionIndex: 0,
      selectedAnswers: [],
      isSubmitted: false,
      correctCount: 0,
      incorrectCount: 0,
      incorrectlyAnsweredIds: [],
      isShaking: false,
    })
  }, [allQuestions, state.incorrectlyAnsweredIds])

  const currentQuestion = useMemo(() => state.activeQuestions[state.currentQuestionIndex], [state.activeQuestions, state.currentQuestionIndex]);

  return {
    state,
    currentQuestion,
    totalQuestions: state.activeQuestions.length,
    actions: {
      handleAnswerSelect,
      handleSubmit,
      handleNext,
      handleReset,
      handleRetryIncorrect,
    },
  }
}
