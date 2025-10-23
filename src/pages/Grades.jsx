import React, { useState, useEffect } from "react";
import { Save, FileText, Loader2 } from "lucide-react";
import supabase  from "../lib/supabase";

export default function GradesPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState("");

  // ✅ Load all subjects
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const { data, error } = await supabase.from("subjects").select("*");
    if (error) console.error("Error fetching subjects:", error);
    else setSubjects(data);
  };

  // ✅ Load enrolled students when a subject is selected
  useEffect(() => {
    if (selectedSubject) fetchEnrolledStudents(selectedSubject);
  }, [selectedSubject]);

  const fetchEnrolledStudents = async (subjectId) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("grades")
      .select("student_id, students(*), prelim, midterm, semifinal, final")
      .eq("subject_id", subjectId);

    if (error) {
      console.error("Fetch students error:", error);
      setStudents([]);
    } else {
      const enrolledStudents = data.map((item) => ({
        ...item.students,
        prelim: item.prelim,
        midterm: item.midterm,
        semifinal: item.semifinal,
        final: item.final,
      }));
      setStudents(enrolledStudents);

      // Preload existing grades into state
      const existingGrades = {};
      data.forEach((item) => {
        existingGrades[item.student_id] = {
          prelim: item.prelim || "",
          midterm: item.midterm || "",
          semifinal: item.semifinal || "",
          final: item.final || "",
        };
      });
      setGrades(existingGrades);
    }

    setLoading(false);
  };

  // ✅ Handle grade input per student
  const handleGradeChange = (studentId, field, value) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  // ✅ Save all grades (manual update-or-insert)
  const handleSaveGrades = async () => {
    if (!selectedSubject) {
      alert("Please select a subject first.");
      return;
    }

    setSaving(true);

    const updates = Object.entries(grades).map(([studentId, g]) => ({
      student_id: parseInt(studentId),
      subject_id: parseInt(selectedSubject),
      prelim: parseFloat(g.prelim) || null,
      midterm: parseFloat(g.midterm) || null,
      semifinal: parseFloat(g.semifinal) || null,
      final: parseFloat(g.final) || null,
    }));

    try {
      for (const g of updates) {
        const { data: existing, error: fetchError } = await supabase
          .from("grades")
          .select("id")
          .eq("student_id", g.student_id)
          .eq("subject_id", g.subject_id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error checking existing grade:", fetchError);
          continue;
        }

        if (existing) {
          // 🟢 Update existing grade
          const { error: updateError } = await supabase
            .from("grades")
            .update({
              prelim: g.prelim,
              midterm: g.midterm,
              semifinal: g.semifinal,
              final: g.final,
            })
            .eq("id", existing.id);

          if (updateError) console.error("Update error:", updateError);
        } else {
          // 🆕 Insert new grade
          const { error: insertError } = await supabase.from("grades").insert(g);
          if (insertError) console.error("Insert error:", insertError);
        }
      }

      alert("✅ Grades saved successfully!");
    } catch (err) {
      console.error("Unexpected save error:", err);
      alert("❌ Something went wrong while saving grades.");
    }

    setSaving(false);
  };

  // ✅ Generate AI report (mock)
  const handleGenerateReport = () => {
    const total = Object.values(grades).reduce(
      (acc, g) =>
        acc +
        (parseFloat(g.prelim || 0) +
          parseFloat(g.midterm || 0) +
          parseFloat(g.semifinal || 0) +
          parseFloat(g.final || 0)) /
          4,
      0
    );
    const avg = (total / students.length).toFixed(2);
    setReport(`AI Analysis: The class average grade for this subject is ${avg}.`);
  };

  return (
    <div className="min-h-screen bg-white-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">Grades</h1>
            <p className="text-indigo-100">
              Record and analyze student grades for each subject.
            </p>
          </div>

          <div className="p-6">
            {/* Select Subject */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">-- Choose Subject --</option>
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.subject_name} ({subj.subject_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center text-gray-600 py-10">
                <Loader2 className="mx-auto animate-spin text-indigo-600 mb-3" />
                Loading enrolled students...
              </div>
            )}

            {/* Grades Table */}
            {!loading && students.length > 0 && selectedSubject && (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-600 text-white">
                      <th className="px-6 py-3 text-left font-semibold">Student</th>
                      <th className="px-4 py-3 text-center font-semibold">Prelim</th>
                      <th className="px-4 py-3 text-center font-semibold">Midterm</th>
                      <th className="px-4 py-3 text-center font-semibold">Semifinal</th>
                      <th className="px-4 py-3 text-center font-semibold">Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, index) => (
                      <tr
                        key={s.id}
                        className={`${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-indigo-50 transition duration-150`}
                      >
                        <td className="px-6 py-3 border-b border-gray-200 font-medium">
                          {s.first_name} {s.last_name}
                        </td>
                        {["prelim", "midterm", "semifinal", "final"].map((field) => (
                          <td
                            key={field}
                            className="px-4 py-3 border-b border-gray-200 text-center"
                          >
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={grades[s.id]?.[field] || ""}
                              onChange={(e) =>
                                handleGradeChange(s.id, field, e.target.value)
                              }
                              className="w-20 px-2 py-1 border rounded-md text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Buttons */}
            {selectedSubject && students.length > 0 && (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSaveGrades}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-md font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} /> Save Grades
                    </>
                  )}
                </button>
                <button
                  onClick={handleGenerateReport}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition shadow-md font-semibold"
                >
                  <FileText size={20} /> Generate AI Report
                </button>
              </div>
            )}

            {/* AI Report Output */}
            {report && (
              <div className="mt-6 p-6 bg-indigo-50 border border-indigo-200 rounded-xl shadow-inner">
                <h2 className="text-lg font-bold text-indigo-700 mb-2">
                  📊 AI Analysis Report
                </h2>
                <p className="text-gray-700">{report}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
