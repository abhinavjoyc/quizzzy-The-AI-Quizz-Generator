import { strict_output } from "@/lib/gpt";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { quizCreationSchema } from "@/schemas/forms/quiz";


export async function POST(req: Request, res: Response) {
  try {

    
    const body = await req.json();
    console.log("Request body:", body);
    
    const { amount, topic, type } = quizCreationSchema.parse(body);
    console.log("Parsed data:", { amount, topic, type });

    let questions: any[] = [];
    
    try {
      if (type === "open_ended") {
        const prompts = Array(amount).fill(
          `you are to generate a random hard open-ended question about ${topic}`
        );
        console.log("Sending prompts to OpenAI:", prompts);
        
        questions = await strict_output(
          "You are a helpful AI that is able to generate pairs of questions and answers. The length of each answer should not be more than 15 words the questions and options should be unique.",
          prompts,
          {
            question: "question",
            answer: "answer with max length of 15 words"
          }
        );
      } else if (type === "mcq") {
        let attempts = 0;
        const maxAttempts = 3;
        let uniqueQuestions: any[] = [];

        while (uniqueQuestions.length < amount && attempts < maxAttempts) {
          const batchQuestions = await strict_output(
            "You are a helpful AI that is able to generate multiple choice questions. You must generate completely different questions about different aspects of the topic. The length of each answer and option should not exceed 15 words.",
            Array(amount).fill(
              `Generate a unique mcq question about ${topic}. The question,answers and sub topic must be completely different from: ${uniqueQuestions.map(q => q.question).join(', ')}. Focus on different aspects of ${topic} making sure to avoid multiple questions from same aspect give one question from one aspect of ${topic}.`
            ),
            {
              question: "question",
              answer: "answer with max length of 15 words",
              option1: "1st option with max length of 15 words",
              option2: "2nd option with max length of 15 words",
              option3: "3rd option with max length of 15 words"
            }
          );

          // Filter out duplicate questions
          for (const question of batchQuestions) {
            if (!uniqueQuestions.some(q => 
              q.question.toLowerCase().trim() === question.question.toLowerCase().trim()
            )) {
              uniqueQuestions.push(question);
            }
          }
          
          attempts++;
        }

        if (uniqueQuestions.length < amount) {
          throw new Error("Failed to generate enough unique questions after multiple attempts");
        }

        questions = uniqueQuestions;
      }

      console.log("Received questions from OpenAI:", questions);
      
      return NextResponse.json(
        {
          questions,
        },
        {
          status: 200
        }
      );

    } catch (openaiError) {
      console.error("OpenAI API Error:", openaiError);
      return NextResponse.json(
        {
          error: "Failed to generate questions",
          details: openaiError instanceof Error ? openaiError.message : "Unknown OpenAI error"
        },
        {
          status: 500
        }
      );
    }

  } catch (error) {
    console.error("Error in quiz generation:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      error
    });
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues,
        },
        {
          status: 400
        }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
        type: error?.constructor?.name
      },
      {
        status: 500
      }
    );
  }
};