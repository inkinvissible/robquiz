// src/app/quiz/[quizId]/page.tsx

import { QuizClient } from '@/components/quiz/QuizClient';
import type { QuizData, Question } from '@/types/quiz';
import fs from 'fs/promises';
import path from 'path';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  const quizzesDir = path.join(process.cwd(), 'src/data/quizzes');
  try {
    const filenames = await fs.readdir(quizzesDir);
    return filenames
      .filter((filename) => filename.endsWith('.json'))
      .map((filename) => ({
        quizId: filename.replace('.json', ''),
      }));
  } catch (error) {
    console.error('Failed to read quizzes directory for generateStaticParams:', error);
    return [];
  }
}

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

async function getQuizData(quizId: string): Promise<QuizData | null> {
  const filePath = path.join(process.cwd(), 'src/data/quizzes', `${quizId}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const rawData: any = JSON.parse(data);

    const questions: Question[] = rawData.questions.map((rawQ: any, index: number) => {
      const correctAnswers = Array.isArray(rawQ.respuesta_correcta)
        ? rawQ.respuesta_correcta
        : [rawQ.respuesta_correcta];
      
      const type = rawQ.es_multiple_seleccion || Array.isArray(rawQ.respuesta_correcta) 
        ? 'multiple' 
        : 'single';

      const cleanOptions = rawQ.opciones.map((opt: string) => opt.trim().replace(/\.$/, ''));
      const shuffledOptions = shuffle([...cleanOptions]);
      const cleanCorrectAnswers = correctAnswers.map((ans: string) => ans.trim().replace(/\.$/, ''));

      return {
        id: index + 1,
        question: rawQ.pregunta,
        options: shuffledOptions,
        correctAnswers: cleanCorrectAnswers,
        type: type,
      };
    });

    return {
      title: rawData.title,
      description: rawData.description,
      questions: questions,
    };
  } catch (error) {
    console.error(`Failed to read or parse ${quizId}.json:`, error);
    return null;
  }
}

const QuizPage = async ({ params }: any) => {
  const quizData = await getQuizData(params.quizId);

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error al Cargar el Cuestionario</AlertTitle>
          <AlertDescription>
            No se pudo cargar el cuestionario "{params.quizId}". Es posible que no exista o esté vacío.
          </AlertDescription>
        </Alert>
        <Link href="/" className="mt-6">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la selección
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-4">
            <Link href="/">
                <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Inicio
                </Button>
            </Link>
        </div>
        <header className="w-full mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary">{quizData.title}</h1>
        </header>
        <QuizClient allQuestions={quizData.questions} quizId={params.quizId} />
      </div>
    </main>
  );
};

export default QuizPage;
