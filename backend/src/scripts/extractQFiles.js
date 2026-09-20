require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const LLM_MODEL = process.env.OPENROUTER_LLM_MODEL || "google/gemini-2.5-flash";

if (!OPENROUTER_API_KEY) {
  console.error("Please set OPENROUTER_API_KEY in .env");
  process.exit(1);
}

const RAW_DIR = path.join(__dirname, '../../data/raw');
const STAGING_DIR = path.join(__dirname, '../../data/staging');

async function extractCourseFromText(text, filename) {
  const prompt = `
You are a data extraction assistant. Extract NSQF course details from the following raw text of a Q-File PDF.
Return ONLY a valid JSON object matching this structure:
{
  "title": "String",
  "titleHi": "",
  "sector": "String",
  "nsqfLevel": Number,
  "minEducation": "String (one of: none, 5th, 8th, 10th, 12th, graduate, unknown)",
  "durationHours": Number or null,
  "jobRoles": ["String"],
  "description": "String",
  "descriptionHi": "",
  "tags": ["String"],
  "sourceName": "NQR",
  "sourceUrl": "",
  "sourceDoc": "${filename}",
  "sourceExcerpt": "Extract a short 1-2 sentence excerpt proving the qualification details",
  "retrievedAt": "${new Date().toISOString().split('T')[0]}",
  "verified": false,
  "isDemo": true
}
Do not include markdown blocks, just the JSON.

PDF Text:
${text.substring(0, 5000)} // Limiting to first 5000 chars for brevity/cost
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  if (data.choices && data.choices[0] && data.choices[0].message) {
    let content = data.choices[0].message.content.trim();
    if (content.startsWith("```json")) {
      content = content.replace(/^```json/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(content);
  } else {
    throw new Error("Failed to get a valid response from LLM");
  }
}

async function run() {
  const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.pdf') && f.toLowerCase().includes('qfile'));
  
  if (files.length === 0) {
    console.log("No Q-File PDFs found in data/raw. Name them like 'qfile-tailor.pdf' to test.");
    process.exit(0);
  }

  const extracted = [];
  for (const file of files) {
    console.log(`Processing ${file}...`);
    const dataBuffer = fs.readFileSync(path.join(RAW_DIR, file));
    try {
      const data = await pdf(dataBuffer);
      const course = await extractCourseFromText(data.text, file);
      extracted.push(course);
      console.log(`Extracted: ${course.title}`);
    } catch (err) {
      console.error(`Error extracting ${file}:`, err);
    }
  }

  if (extracted.length > 0) {
    fs.writeFileSync(path.join(STAGING_DIR, 'courses.json'), JSON.stringify(extracted, null, 2));
    console.log(`Saved ${extracted.length} courses to data/staging/courses.json`);
  }
}

run();
