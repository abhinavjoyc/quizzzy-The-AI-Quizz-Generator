import React from "react";

import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import QuizCreation from "@/components/forms/QuizCreation";


export const metadata = {
  title: "Quiz | Quizzzy",
  description: "Quiz yourself on anything!",
};


const Quiz = async ({ searchParams }: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }
  return  <QuizCreation/>
};

export default Quiz;