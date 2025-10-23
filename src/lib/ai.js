import { GoogleGenAI } from '@google/genai';
import supabase from './supabase';

// Initialize Google GenAI
const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export default async function studentsAnalyzer(subjectId) {
  // Fetch grades from Supabase
  const { data, error } = await supabase
    .from('grades')
    .select('prelim, midterm, semifinal, final, students(name)')
    .eq('subject_id', subjectId);

  if (error) {
    console.error('Supabase error:', error);
    return {
      analysis: 'Error fetching data.',
      passedStudents: [],
      failedStudents: [],
    };
  }

  const gradeData = (data || []).map((g) => ({
    name: g.students?.name ?? 'Unknown',
    prelim: g.prelim ?? 0,
    midterm: g.midterm ?? 0,
    semifinal: g.semifinal ?? 0,
    final: g.final ?? 0,
  }));

  const inputText = `
You are an AI student performance analyzer.

Compute each student's average (mean of all grades),
determine who passed (<= 3.0) or failed (> 3.0),
and summarize results in strict JSON:

{
  "response": "Summary",
  "studentsPassed": [ { "name": "string", "average": number } ],
  "studentsFailed": [ { "name": "string", "average": number } ]
}

Here is the data:
${JSON.stringify(gradeData, null, 2)}
`;

  try {
    const result = await genAI.generate({
      model: 'gemini-1.5-flash', // specify the model here
      temperature: 0.2,
      candidate_count: 1,
      messages: [{ role: 'user', content: inputText }],
    });

    // Access the generated text
    const responseText = result?.candidates?.[0]?.content ?? '';

    try {
      return JSON.parse(responseText);
    } catch {
      return { analysis: responseText, passedStudents: [], failedStudents: [] };
    }
  } catch (err) {
    console.error('Gemini error:', err);
    return {
      analysis: 'AI analysis failed.',
      passedStudents: [],
      failedStudents: [],
    };
  }
}
