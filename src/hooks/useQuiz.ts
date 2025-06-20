"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { Question } from "@/types/quiz"
import { useToast } from "@/hooks/use-toast"

const getLocalStorageKey = (quizId: string) => `quizmaster-progress-${quizId}`

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

export function useQuiz(allQuestions: Question[], quizId: string) {
  const { toast } = useToast()
  
  const [state, setState] = useState<QuizState>({
    status: "loading",
    activeQuestions: [],
    currentQuestionIndex: 0,
    selectedAnswers: [],
    isSubmitted: false,
    correctCount: 0,
    incorrectCount: 0,
    incorrectlyAnsweredIds: [],
    isShaking: false,
  })

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

  useEffect(() => {
    const LOCAL_STORAGE_KEY = getLocalStorageKey(quizId);
    try {
      const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        const activeQuestions = savedState.activeQuestions.map((savedQ: Question) => 
            allQuestions.find(q => q.id === savedQ.id)
        ).filter(Boolean) as Question[]

        if(activeQuestions.length > 0) {
            setState({ ...savedState, activeQuestions, status: savedState.status || 'active' })
        } else {
            startNewQuiz(allQuestions)
        }
      } else {
        startNewQuiz(allQuestions)
      }
    } catch (error) {
      console.error("Failed to load from localStorage", error)
      startNewQuiz(allQuestions)
    }
  }, [quizId, allQuestions, startNewQuiz])

  useEffect(() => {
    if (state.status !== "loading" && state.activeQuestions.length > 0) {
      const LOCAL_STORAGE_KEY = getLocalStorageKey(quizId);
      try {
        const stateToSave = { ...state, isShaking: false }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave))
      } catch (error) {
        console.error("Failed to save to localStorage", error)
      }
    }
  }, [state, quizId])
  
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

    const correctAnswers = currentQuestion.correctAnswers.sort()
    const selected = state.selectedAnswers.sort()
    const isCorrect = correctAnswers.length === selected.length && correctAnswers.every((val, index) => val === selected[index]);

    if (isCorrect) {
      setState(prevState => ({ ...prevState, isSubmitted: true, correctCount: prevState.correctCount + 1 }))
      toast({ title: "¡Correcto!", description: "¡Buen trabajo!", duration: 2000 })
    } else {
      setState(prevState => ({
        ...prevState,
        isSubmitted: true,
        incorrectCount: prevState.incorrectCount + 1,
        incorrectlyAnsweredIds: Array.from(new Set([...prevState.incorrectlyAnsweredIds, currentQuestion.id])),
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
    const LOCAL_STORAGE_KEY = getLocalStorageKey(quizId);
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    startNewQuiz(allQuestions)
  }, [allQuestions, startNewQuiz, quizId])
  
  const handleRetryIncorrect = useCallback(() => {
    const incorrectQuestions = allQuestions.filter(q => state.incorrectlyAnsweredIds.includes(q.id))
    if(incorrectQuestions.length > 0) {
        const LOCAL_STORAGE_KEY = getLocalStorageKey(quizId);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        startNewQuiz(incorrectQuestions);
    }
  }, [allQuestions, state.incorrectlyAnsweredIds, startNewQuiz, quizId])

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
