import React, { useState, useEffect } from "react";
import { Save, FileText, Loader2, Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import supabase from "../lib/supabase";
import studentsAnalyzer from "../lib/ai";
import GradesReportPDF from "../components/gradesreportPDF";
import toast, { Toaster } from "react-hot-toast";

export default function GradesPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const { data, error } = await supabase.from("subjects").select("*");
    if (error) console.error("Error fetching subjects:", error);
    else setSubjects(data);
  };

  useEffect(() => {
    if (selectedSubject) fetchEnrolledStudents(selectedSubject);
  }, [selectedSubject]);

  const fetchEnrolledStudents = async (subjectId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("grades")
      .select("id, student_id, students(*), prelim, midterm, semifinal, final")
      .eq("subject_id", subjectId);

    if (error) {
      console.error("Fetch students error:", error);
      setStudents([]);
      setLoading(false);
      return;
    }

    const enrolledStudents = data.map((item) => ({
      id: item.student_id,
      name: `${item.students.first_name} ${item.students.last_name}`,
      prelim: item.prelim,
      midterm: item.midterm,
      semifinal: item.semifinal,
      final: item.final,
    }));

    setStudents(enrolledStudents);

    const existingGrades = {};
    data.forEach((item) => {
      existingGrades[item.student_id] = {
        id: item.id,
        prelim: item.prelim || "",
        midterm: item.midterm || "",
        semifinal: item.semifinal || "",
        final: item.final || "",
      };
    });
    setGrades(existingGrades);
    setLoading(false);
  };

  const handleGradeChange = (studentId, field, value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = "";
    else {
      num = Math.min(Math.max(num, 1), 5);
      num = Math.round(num * 4) / 4;
    }

    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: num,
      },
    }));
  };

  const calculateTotalGrade = (grade) => {
    const { prelim, midterm, semifinal, final } = grade;
    const scores = [prelim, midterm, semifinal, final].map(Number).filter((n) => !isNaN(n));
    if (!scores.length) return "";
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return avg.toFixed(2);
  };

  const handleSaveGrades = async () => {
    if (!selectedSubject) {
      toast.error("Please select a subject first.");
      return;
    }

    setSaving(true);
    const savingToast = toast.loading("Saving grades...");

    try {
      const { data: existingGrades, error: fetchError } = await supabase
        .from("grades")
        .select("*")
        .eq("subject_id", selectedSubject);

      if (fetchError) throw fetchError;

      const gradesToUpdate = [];
      const gradesToInsert = [];

      Object.entries(grades).forEach(([studentId, g]) => {
        const payload = {
          student_id: parseFloat(studentId),
          subject_id: parseFloat(selectedSubject),
          prelim: parseFloat(g.prelim) || null,
          midterm: parseFloat(g.midterm) || null,
          semifinal: parseFloat(g.semifinal) || null,
          final: parseFloat(g.final) || null,
        };
        const existing = existingGrades.find((eg) => eg.student_id === parseInt(studentId));

        if (existing) {
          payload.id = existing.id;
          gradesToUpdate.push(payload);
        } else {
          gradesToInsert.push(payload);
        }
      });

      if (gradesToUpdate.length > 0) {
        const { error: updateError } = await supabase.from("grades").upsert(gradesToUpdate, {
          onConflict: ["id"],
        });
        if (updateError) throw updateError;
      }

      if (gradesToInsert.length > 0) {
        const { error: insertError } = await supabase.from("grades").insert(gradesToInsert);
        if (insertError) throw insertError;
      }

      toast.success("Grades saved successfully!", {
        id: savingToast,
        style: { background: "#ffffffff", color: "#000000ff" },
      });

      fetchEnrolledStudents(selectedSubject);
    } catch (err) {
      console.error("Save grades error:", err);
      toast.error("Something went wrong while saving grades.", {
        id: savingToast,
        style: { background: "#ffffffff", color: "#000000ff" },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedSubject) return toast.error("Please select a subject first.");
    setAnalyzing(true);
    setAnalysis(null);
    const result = await studentsAnalyzer(selectedSubject);
    setAnalysis(result);
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      {/* ✅ Toaster for react-hot-toast */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-green-600 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">Grades</h1>
            <p className="text-green-100">Record and analyze student grades for each subject.</p>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
              >
                <option value="">-- Choose Subject --</option>
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.subject_name} ({subj.subject_code})
                  </option>
                ))}
              </select>
            </div>

            {loading && (
              <div className="text-center text-gray-600 py-10">
                <Loader2 className="mx-auto animate-spin text-green-600 mb-3" />
                Loading enrolled students...
              </div>
            )}

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
                      <th className="px-4 py-3 text-center font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, index) => {
                      const total = calculateTotalGrade(grades[s.id] || {});
                      const status = total ? (parseFloat(total) <= 3 ? "Passed" : "Failed") : "";
                      return (
                        <tr
                          key={s.id}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-green-50 transition`}
                        >
                          <td className="px-6 py-3 border-b border-gray-200 font-medium">{s.name}</td>
                          {["prelim", "midterm", "semifinal", "final"].map((field) => (
                            <td key={field} className="px-4 py-3 border-b border-gray-200 text-center">
                              <input
                                type="number"
                                min="1"
                                max="5"
                                step="0.25"
                                value={grades[s.id]?.[field] || ""}
                                onChange={(e) => handleGradeChange(s.id, field, e.target.value)}
                                className="w-20 px-2 py-1 border rounded-md text-center focus:ring-2 focus:ring-green-500 focus:outline-none"
                              />
                            </td>
                          ))}
                          <td
                            className={`px-4 py-3 border-b border-gray-200 text-center font-bold ${
                              status === "Failed" ? "text-red-600" : "text-green-700"
                            }`}
                          >
                            {total}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {selectedSubject && students.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-6">
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
                  disabled={analyzing}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition shadow-md font-semibold"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText size={20} /> Generate AI Report
                    </>
                  )}
                </button>

                {analysis &&
                  (() => {
                    const subject =
                      subjects.find((s) => s.id === parseInt(selectedSubject)) || {};
                    const subjectName = subject.subject_name || subject.name || "Subject";

                    return (
                      <PDFDownloadLink
                        document={
                          <GradesReportPDF
                            subject={subject}
                            analysis={analysis.analysis}
                            students={students}
                          />
                        }
                        fileName={`${subjectName} - Grade Report.pdf`}
                      >
                        {({ loading }) => (
                          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md font-semibold">
                            {loading ? (
                              <>
                                <Loader2 className="animate-spin" size={20} /> Preparing PDF...
                              </>
                            ) : (
                              <>
                                <Download size={20} /> Download PDF
                              </>
                            )}
                          </button>
                        )}
                      </PDFDownloadLink>
                    );
                  })()}
              </div>
            )}

            {analysis && (
              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl shadow-inner">
                <h2 className="text-lg font-bold text-green-700 mb-2">
                  📊 AI Grade Analysis Summary
                </h2>
                <pre className="text-gray-700 whitespace-pre-wrap">{analysis.summaryText}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}