// page.tsx
import React from "react";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import CertificateView from "./CertificateView";

interface Props {
  params: {
    gameId: string;
  };
}

interface Game {
  id: string;
  topic: string;
  questions: {
    id: string;
    question: string;
    options: string[];
  }[];
}

const MCQPage = async ({ params: { gameId } }: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      questions: {
        select: {
          id: true,
          question: true,
          options: true,
        },
      },
    },
  }) as Game | null;

  if (!game) {
    return <div>Game not found</div>;
  }

  return (
    <CertificateView 
      userName={session.user.name || "Student"} 
      topic={game.topic} 
    />
  );
};

export default MCQPage;