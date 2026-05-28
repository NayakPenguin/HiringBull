import { Request, Response } from "express";
import { log } from "../utils/logger.js";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const MINIMAX_MODEL = "MiniMax-M2.7";

interface AnalyzeRequest {
  resume: string;
  jobDescription?: string;
  mode: "match" | "review";
}

/**
 * Call AI API for resume analysis (Minimax primary, OpenAI fallback)
 */
async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  // Try Minimax first
  if (MINIMAX_API_KEY) {
    const response = await fetch("https://api.minimaxi.chat/v1/text/chatcompletion_v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (response.ok) {
      const data = await response.json() as any;
      return data.choices?.[0]?.message?.content || "Unable to generate analysis.";
    }
    log.warn(`Minimax API error: ${response.status}, falling back to OpenAI`);
  }

  // Fallback to OpenAI
  if (OPENAI_API_KEY) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`AI service unavailable (${response.status})`);
    }

    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content || "Unable to generate analysis.";
  }

  throw new Error("No AI provider configured. Set MINIMAX_API_KEY or OPENAI_API_KEY.");
}

/**
 * POST /api/ai/analyze
 */
export async function analyzeResume(req: Request, res: Response) {
  try {
    const { resume, jobDescription, mode } = req.body as AnalyzeRequest;

    if (!resume || !resume.trim()) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    if (mode === "match" && (!jobDescription || !jobDescription.trim())) {
      return res.status(400).json({ error: "Job description is required for match mode" });
    }

    // Set up SSE for streaming thinking steps
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Send thinking steps
    const sendStep = (step: string, status: "loading" | "done") => {
      res.write(`data: ${JSON.stringify({ type: "step", step, status })}\n\n`);
    };

    sendStep("Reading your resume...", "loading");
    await new Promise((r) => setTimeout(r, 800));
    sendStep("Reading your resume...", "done");

    if (mode === "match") {
      sendStep("Parsing job requirements...", "loading");
      await new Promise((r) => setTimeout(r, 600));
      sendStep("Parsing job requirements...", "done");

      sendStep("Analyzing skill match...", "loading");
      await new Promise((r) => setTimeout(r, 400));
    } else {
      sendStep("Evaluating resume quality...", "loading");
      await new Promise((r) => setTimeout(r, 600));
      sendStep("Evaluating resume quality...", "done");

      sendStep("Checking ATS compatibility...", "loading");
      await new Promise((r) => setTimeout(r, 400));
    }

    // Build prompts
    let systemPrompt: string;
    let userPrompt: string;

    if (mode === "match") {
      systemPrompt = `You are HiringBull Copilot, an expert career advisor AI. Analyze the candidate's resume against the provided job description. Return a JSON object (no markdown, no code fences) with this exact structure:
{
  "matchScore": <number 0-100>,
  "summary": "<one paragraph overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "gaps": ["<gap 1>", "<gap 2>", ...],
  "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>", ...],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", ...],
  "improvedBullets": ["<rewritten bullet 1>", "<rewritten bullet 2>", ...]
}
Be specific, actionable, and honest. Focus on what would actually help the candidate land this specific role.`;

      userPrompt = `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}`;
    } else {
      systemPrompt = `You are HiringBull Copilot, an expert career advisor AI. Review the candidate's resume for overall quality, ATS-friendliness, and impact. Return a JSON object (no markdown, no code fences) with this exact structure:
{
  "overallScore": <number 0-100>,
  "summary": "<one paragraph overall assessment>",
  "formatScore": <number 0-100>,
  "contentScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "issues": ["<issue 1>", "<issue 2>", ...],
  "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>", ...],
  "improvedBullets": ["<rewritten bullet 1>", "<rewritten bullet 2>", ...]
}
Be specific, actionable, and honest. Focus on what would make this resume stand out.`;

      userPrompt = `RESUME:\n${resume}`;
    }

    // Call AI
    const analysis = await callAI(systemPrompt, userPrompt);

    sendStep(mode === "match" ? "Analyzing skill match..." : "Checking ATS compatibility...", "done");
    sendStep("Generating recommendations...", "done");

    // Parse the AI response
    let parsedAnalysis: any;
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      parsedAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: analysis };
    } catch {
      parsedAnalysis = { summary: analysis };
    }

    // Send final result
    res.write(`data: ${JSON.stringify({ type: "result", data: parsedAnalysis })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    log.error(`AI analyze error: ${error.message}`);
    // If headers already sent (SSE started), send error event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: "error", message: "Analysis failed. Please try again." })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: "Analysis failed. Please try again." });
    }
  }
}
