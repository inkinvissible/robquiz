import { QuizClient } from '@/components/quiz/QuizClient';
import type { Question } from '@/types/quiz';
import fs from 'fs/promises';
import path from 'path';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

async function getQuestions(): Promise<Question[]> {
  // Correctly locate the file within the src directory
  const filePath = path.join(process.cwd(), 'src/data', 'questions.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read questions.json:', error);
    // Return an empty array or throw an error, depending on desired error handling
    return [];
  }
}

export default async function Home() {
  const questions = await getQuestions();

  if (!questions || questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error al Cargar el Cuestionario</AlertTitle>
          <AlertDescription>
            No se pudieron cargar las preguntas del cuestionario. Por favor, revise los registros del servidor para más información.
          </AlertDescription>
        </Alert>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <QuizClient allQuestions={questions} />
    </main>
  );
}
