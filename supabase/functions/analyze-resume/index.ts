import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText } = await req.json();

    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Please provide valid resume text (at least 20 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert resume reviewer and career coach. Analyze the provided resume text and return a detailed evaluation.

You MUST respond using the "analyze_resume" tool/function provided.

Scoring criteria (each 0-100):
- overallScore: Overall resume quality
- formatting: Structure, readability, consistency
- content: Relevance, achievements, quantifiable results
- keywords: Industry-relevant keywords and ATS optimization
- impact: Use of action verbs, measurable outcomes

For suggestions, provide actionable, specific improvements grouped by category.
For strengths, highlight what the resume does well.
Keep feedback professional, encouraging, and constructive.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please analyze this resume:\n\n${resumeText}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_resume",
              description: "Return structured resume analysis with scores, strengths, and suggestions.",
              parameters: {
                type: "object",
                properties: {
                  overallScore: { type: "number", description: "Overall score 0-100" },
                  scores: {
                    type: "object",
                    properties: {
                      formatting: { type: "number" },
                      content: { type: "number" },
                      keywords: { type: "number" },
                      impact: { type: "number" },
                    },
                    required: ["formatting", "content", "keywords", "impact"],
                  },
                  summary: { type: "string", description: "2-3 sentence overall assessment" },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of resume strengths",
                  },
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: {
                          type: "string",
                          enum: ["formatting", "content", "keywords", "impact", "general"],
                        },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        title: { type: "string" },
                        description: { type: "string" },
                      },
                      required: ["category", "priority", "title", "description"],
                    },
                  },
                },
                required: ["overallScore", "scores", "summary", "strengths", "suggestions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_resume" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No analysis returned from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-resume error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
