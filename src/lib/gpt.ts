import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEYy,
});

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  model: string = "gpt-3.5-turbo",
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
): Promise<any> {
  const prompts = Array.isArray(user_prompt) ? user_prompt : [user_prompt];

  let results: any[] = [];

  for (const prompt of prompts) {
    let error_msg = "";
    for (let i = 0; i < num_tries; i++) {
      try {
        const messages = [
          { role: "system", content: `${system_prompt}\nOutput format: ${JSON.stringify(output_format)}${error_msg}` },
          { role: "user", content: prompt }
        ];

        if (verbose) console.log("Sending messages:", JSON.stringify(messages, null, 2));

        const completion = await openai.chat.completions.create({
          model,
          messages,
          temperature
        });

        const rawResponse = completion.choices[0]?.message?.content?.trim() ?? "";

        if (verbose) console.log("Raw GPT response:", rawResponse);

        // Ensure valid JSON response
        const cleanedResponse = rawResponse.replace(/^```json\s*|\s*```$/g, "");
        const output = JSON.parse(cleanedResponse);

        results.push(output);
        break;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        error_msg = `\n\nPrevious attempt failed: ${error instanceof Error ? error.message : String(error)}. Ensure ONLY valid JSON.`;

        if (i === num_tries - 1) {
          throw new Error(`Failed after ${num_tries} attempts: ${error.message}`);
        }
      }
    }
  }

  return results.length === 1 ? results[0] : results;
}
