import { GoogleGenAI } from "@google/genai";
import supabase from "./supabase";

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

function computeGrade(average) {
  const snapped = Math.round(average * 4) / 4;
  return Math.min(Math.max(snapped, 1), 5);
}

export default async function studentsAnalyzer(subjectId, customInputText) {
  const { data, error } = await supabase
    .from("grades")
    .select("prelim, midterm, semifinal, final, students(first_name, last_name)")
    .eq("subject_id", subjectId);

  if (error) {
    console.error("Supabase error:", error);
    return {
      summaryText: "Error fetching data.",
      studentsPassed: [],
      studentsFailed: [],
    };
  }

  const gradeData = (data || []).map((g) => {
    const prelim = g.prelim ?? 5;
    const midterm = g.midterm ?? 5;
    const semifinal = g.semifinal ?? 5;
    const final = g.final ?? 5;
    const scores = [prelim, midterm, semifinal, final];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      name: `${g.students?.first_name ?? "Unknown"} ${g.students?.last_name ?? ""}`.trim(),
      average: avg,
      grade: computeGrade(avg),
      prelim,
      midterm,
      semifinal,
      final,
    };
  });

  if (!gradeData.length) {
    return {
      summaryText: "No grade data available.",
      studentsPassed: [],
      studentsFailed: [],
    };
  }

  const studentsPassed = gradeData.filter((s) => s.grade <= 3.0);
  const studentsFailed = gradeData.filter((s) => s.grade > 3.0);

  const fallbackSummary = `
Out of ${gradeData.length} students:
✅ ${studentsPassed.length} passed
❌ ${studentsFailed.length} failed

Grade Range: ${Math.min(...gradeData.map(s => s.grade)).toFixed(2)} – ${Math.max(...gradeData.map(s => s.grade)).toFixed(2)}

Passed Students:
${studentsPassed.length > 0 ? studentsPassed.map(s => `• ${s.name} (${s.grade.toFixed(2)})`).join('\n') : 'None'}

Failed Students:
${studentsFailed.length > 0 ? studentsFailed.map(s => `• ${s.name} (${s.grade.toFixed(2)})`).join('\n') : 'None'}
`;

  const inputText = customInputText || `
You are an AI student performance analyzer.

You will receive data from Supabase including students, their grades, and the subject details.
Analyze their performance and predict how likely they are to pass next term.

Student data:
${gradeData.map((s, i) => `${i + 1}. ${s.name} — Prelim: ${s.prelim}, Midterm: ${s.midterm}, Semifinal: ${s.semifinal}, Final: ${s.final}, Average: ${s.average.toFixed(2)}`).join('\n')}

You must respond in **strict JSON** format:

{
 "response": "Summary or prediction (1-2 sentences)",
 "studentsPassed": [
  { "id": number, "name": "string", "average": number }
 ],
 "studentsFailed": [
  { "id": number, "name": "string", "average": number }
 ]
}

- Compute each student's average grade (mean of prelim, midterm, semifinals, finals).
- Passing threshold is <= 3.00.
- Use logical, evidence-based reasoning in your summary.
responseMimeType: "application/json"
`;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: inputText }] }],
      temperature: 0.2,
    });

    const responseText = result.output_text || "";
    let parsed;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0].trim());
      } catch {
        console.warn("AI returned malformed JSON, using fallback summary.");
      }
    }

    if (parsed && parsed.response) {
      parsed.studentsPassed = parsed.studentsPassed.map((s, i) => ({
        id: s.id ?? i + 1,
        name: s.name,
        average: s.average ?? studentsPassed.find(sp => sp.name === s.name)?.average ?? 0,
      }));

      parsed.studentsFailed = parsed.studentsFailed.map((s, i) => ({
        id: s.id ?? i + 1,
        name: s.name,
        average: s.average ?? studentsFailed.find(sf => sf.name === s.name)?.average ?? 0,
      }));

      const summaryText = `
📊 AI Grade Analysis Summary:

${parsed.response}

Passed Students:
${parsed.studentsPassed.length > 0 ? parsed.studentsPassed.map(s => `• ${s.name} (${s.average.toFixed(2)})`).join('\n') : 'None'}

Failed Students:
${parsed.studentsFailed.length > 0 ? parsed.studentsFailed.map(s => `• ${s.name} (${s.average.toFixed(2)})`).join('\n') : 'None'}
      `.trim();

      return { ...parsed, summaryText };
    }

    return {
      summaryText: fallbackSummary.trim(),
      studentsPassed: studentsPassed.map((s, i) => ({ id: i + 1, name: s.name, average: s.average })),
      studentsFailed: studentsFailed.map((s, i) => ({ id: i + 1, name: s.name, average: s.average })),
    };
  } catch (err) {
    console.error("Gemini error:", err);
    return {
      summaryText: fallbackSummary.trim(),
      studentsPassed: studentsPassed.map((s, i) => ({ id: i + 1, name: s.name, average: s.average })),
      studentsFailed: studentsFailed.map((s, i) => ({ id: i + 1, name: s.name, average: s.average })),
    };
  }
}
