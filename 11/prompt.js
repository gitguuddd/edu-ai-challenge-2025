import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import fs from "fs";
import { getAudioDurationInSeconds } from 'get-audio-duration';

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


const summarySchema = z.object({
    summary: z.string(),
    analysis: z.object({
        speaking_speed_wpm: z.number(),
        word_count: z.number(),
        frequently_mentioned_topics: z.array(z.object({
            topic: z.string(),
            mentions: z.number()
        })),        
    })
});

export const transcribeAudio = async (filename) => {
    try{
        const translation = await openaiClient.audio.translations.create({
            file: fs.createReadStream(filename),
            model: "whisper-1",
            prompt: `You are a helpful assistant that transcribes audio files. You must transcribe the audio file and return the transcription in JSON format.
                     DO NOT BLOAT THE TRANSCRIPTION, KEEP ONLY THE WORDS THAT WERE ACTUALLY SAID.
                     You can expect other languages than english, poor audio quality. Pay attention to the very beggining and the end of the file as to not
                     crop any info`
          });
        
        const duration = await getAudioDurationInSeconds(filename);

        return {
        transcription: translation.text,
        duration: duration
        }
    } catch (error) {
        console.error("Error transcribing audio:", error);
        throw error;
    }
};

export const summarizeAndAnalyzeText = async (transcription, duration) => {
    try{
        const summary = await openaiClient.chat.completions.create({
            model: "gpt-4.1-mini",
            temperature: 0,
            seed: 12345,
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant that takes a transcription of an audio file and summarizes it and analyzes it.
                            During summarization you must convert long transcripts into concise summaries, focus on preserving core intent and main takeaways.
                            You must also analyze the transcription, provide EXACT word count and calculate speaking speed in words per minute.
                            
                            For word counting, use this exact method:
                            1. Trim the text to remove leading/trailing whitespace
                            2. Split by any whitespace (spaces, tabs, newlines) using regex /\\s+/
                            3. Filter out empty strings
                            4. Count the remaining valid words
                            
                            Calculate speaking speed as: (word_count / (duration_seconds / 60))
                            
                            This ensures consistent word counting that matches text editors.
                            The output should be in JSON format.`
                            
                },
                {
                    role: "user",
                    content: `Duration of the audio file is ${duration} seconds. Here is the transcription to analyze:\n\n${transcription}`
                }
            ],
            response_format: zodResponseFormat(summarySchema, "summary")
        });

        const result = JSON.parse(summary.choices[0].message.content);

        return {
            summary: result.summary,
            speaking_speed: result.analysis.speaking_speed_wpm,
            word_count: result.analysis.word_count,
            frequently_mentioned_topics: result.analysis.frequently_mentioned_topics
        }
    } catch (error) {
        console.error("Error summarizing and analyzing text:", error);
        throw error;
    }
}