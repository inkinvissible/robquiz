import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { QuizData } from '@/types/quiz';

interface QuizInfo {
  id: string;
  title: string;
  description: string;
}

async function getQuizzes(): Promise<QuizInfo[]> {
  const quizzesDir = path.join(process.cwd(), 'src/data/quizzes');
  try {
    const filenames = await fs.readdir(quizzesDir);
    const quizzes = await Promise.all(
      filenames.map(async (filename) => {
        if (filename.endsWith('.json')) {
          const filePath = path.join(quizzesDir, filename);
          const fileContents = await fs.readFile(filePath, 'utf-8');
          const quizData: QuizData = JSON.parse(fileContents);
          return {
            id: filename.replace('.json', ''),
            title: quizData.title,
            description: quizData.description,
          };
        }
        return null;
      })
    );
    return quizzes.filter((quiz): quiz is QuizInfo => quiz !== null);
  } catch (error) {
    console.error('Failed to read quizzes directory:', error);
    return [];
  }
}

export default async function Home() {
  const quizzes = await getQuizzes();

  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-primary">Bienvenido a QuizMaster</h1>
          <p className="mt-4 text-lg text-muted-foreground">Elige un cuestionario para comenzar y poner a prueba tus conocimientos.</p>
        </header>
        
        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <CardHeader className="flex-grow">
                  <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                  <CardDescription className="pt-2">{quiz.description}</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto bg-secondary/50 p-4">
                  <Link href={`/quiz/${quiz.id}`} className="w-full">
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      Iniciar Cuestionario
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">No se encontraron cuestionarios. Vuelve a intentarlo más tarde.</p>
          </div>
        )}
      </div>
    </main>
  );
}
