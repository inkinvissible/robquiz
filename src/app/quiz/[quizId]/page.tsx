import { QuizClient } from '@/components/quiz/QuizClient';
import type { QuizData } from '@/types/quiz';
import fs from 'fs/promises';
import path from 'path';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getQuizData(quizId: string): Promise<QuizData | null> {
  const filePath = path.join(process.cwd(), 'src/data/quizzes', `${quizId}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to read ${quizId}.json:`, error);
    return null;
  }
}

export default async function QuizPage({ params }: { params: { quizId: string } }) {
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
      <header className="w-full max-w-2xl mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">{quizData.title}</h1>
      </header>
      <QuizClient allQuestions={quizData.questions} quizId={params.quizId} />
    </main>
  );
}
