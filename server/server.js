

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Groq Client
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

app.post("/analyze", async (req, res) => {
  try {
    const { code } = req.body;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `
You are a senior software engineer and expert code reviewer.

Analyze the given code carefully.

Return the response ONLY in proper markdown format.

Use this exact structure:

# Code Analysis Report

## Bugs
- Mention all bugs clearly

## Security Issues
- Mention vulnerabilities if any

## Bad Practices
- Mention bad coding practices

## Optimizations
- Mention performance improvements

## Suggested Improved Code
\`\`\`javascript
// improved code here
\`\`\`

Keep the response clean, professional, and properly formatted.
`,
        },
        {
          role: "user",
          content: code,
        },
      ],

      temperature: 0.5,
    });

    const analysis = response.choices[0].message.content;

    res.json({ analysis });
  } catch (error) {
    console.error("Groq API Error:", error);

    if (error.status === 429) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please try again later.",
      });
    }

    res.status(500).json({
      error: error?.message || "Something went wrong",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
