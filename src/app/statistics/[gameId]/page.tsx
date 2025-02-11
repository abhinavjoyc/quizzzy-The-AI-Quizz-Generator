// File: src/app/statistics/[gameId]/page.tsx

import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { LucideLayoutDashboard } from "lucide-react";
import Link from "next/link";
import ResultsCard from "@/components/statistics/ResultCard";
import AccuracyCard from "@/components/statistics/AccurayCard";
import TimeTakenCard from "@/components/statistics/TimeTakenCard";
import QuestionsList from "@/components/statistics/QuestionList";
import ChatBot from "@/app/statistics/[gameId]/Chatbutton";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type Props = {
  params: {
    gameId: string;
  };
};

async function StatisticsPage({ params: { gameId } }: Props) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return redirect("/");
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { questions: true },
    });

    if (!game) {
      return redirect("/");
    }

    let accuracy: number = 0;
    if (game.gameType === "mcq") {
      const totalCorrect = game.questions.reduce((acc, question) => {
        return question.isCorrect ? acc + 1 : acc;
      }, 0);
      accuracy = (totalCorrect / game.questions.length) * 100;
    } else if (game.gameType === "open_ended") {
      const totalPercentage = game.questions.reduce((acc, question) => {
        return acc + (question.percentageCorrect ?? 0);
      }, 0);
      accuracy = totalPercentage / game.questions.length;
    }
    accuracy = Math.round(accuracy * 100) / 100;

    return (
      <div className="p-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Summary</h2>
          <div className="flex items-center space-x-2">
            <Link href="/dashboard" className={buttonVariants()}>
              <LucideLayoutDashboard className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 mt-4 md:grid-cols-7">
          <ResultsCard accuracy={accuracy} />
          <AccuracyCard accuracy={accuracy} />
          <TimeTakenCard
            timeEnded={new Date(game.timeEnded ?? 0)}
            timeStarted={new Date(game.timeStarted ?? 0)}
          />
        </div>

        <QuestionsList questions={game.questions} />

        {/* Horizontally aligned buttons with spacing */}
        <div className="mt-8 flex justify-center space-x-6">
          <Link href={`/downloads/${game.id}`}>
            <button className="px-6 py-2 text-white bg-black rounded-md hover:bg-gray-800">
              Download Certificate
            </button>
          </Link>

          <ChatBot gameId={game.id} topic={game.topic} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in StatisticsPage:", error);
    return redirect("/");
  }
}

export default StatisticsPage;
