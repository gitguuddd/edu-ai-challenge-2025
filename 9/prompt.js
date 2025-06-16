import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import spotifyExample from "./examples/spotify.json" assert { type: "json" };
import nordVPNExample from "./examples/nordVPN.json" assert { type: "json" };

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const constructInstructions = () => {
    return `You are an expert service analyst.
            You will be given a service name or a raw description of a service.
            You will then analyze the service and provide a detailed analysis of the service.
            For raw description case you should not extrapolate additional information, only give what you were able to extract from the description.
            If info is missing do not return placeholder text - leave it as empty string or empty array
            Service name mode will be provided in the following format: "The service name is :"
            Raw description mode will be provided in the following format: "The raw description is :"
            Out of the input the following information should be extracted in JSON format:
            - Brief History: Founding year, milestones, etc. (briefHistory)
            - Target Audience: Primary user segments (targetAudience)
            - Core Features: Top 2–4 key functionalities (coreFeatures)
            - Unique Selling Points: Key differentiators (uniqueSellingPoints)
            - Business Model: How the service makes money (businessModel)
            - Tech Stack Insights: Any hints about technologies used (techStackInsights)
            - Perceived Strengths: Mentioned positives or standout features (perceivedStrengths)
            - Perceived Weaknesses: Cited drawbacks or limitations (perceivedWeaknesses)`
}

const outputSchema = z.object({
    briefHistory: z.string(),
    targetAudience: z.string(),
    coreFeatures: z.array(z.string()).min(2).max(4),
    uniqueSellingPoints: z.array(z.string()),
    businessModel: z.string(),
    techStackInsights: z.array(z.string()),
    perceivedStrengths: z.array(z.string()),
    perceivedWeaknesses: z.array(z.string())
});

export const analyzerPrompt = async (mode, input) => {
    const userContent = mode === 'serviceName' ? `The service name is: ${input}` : `The raw description is: ${input}`;

    const messages = [
        { role: "system", content: constructInstructions() },
        { role: "user", content: spotifyExample.input },
        { role: "assistant", content: JSON.stringify(spotifyExample.output) },
        { role: "user", content: nordVPNExample.input },
        { role: "assistant", content: JSON.stringify(nordVPNExample.output) },
        { role: "user", content: userContent }
    ];

    const response = await openaiClient.chat.completions.parse({
        model: "gpt-4.1-mini",
        messages: messages,
        response_format: zodResponseFormat(outputSchema, "serviceAnalysis"),
    });

    return response.choices[0]?.message.parsed;
}