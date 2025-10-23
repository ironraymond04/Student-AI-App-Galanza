import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { PDFDownloadLink } from '@react-pdf/renderer';
import GradesReportPDF from '../components/gradesreportPDF';
import studentsAnalyzer from '../lib/ai';

export default function Grades() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase.from('subjects').select('*');
      if (!error) setSubjects(data);
    };
    fetchSubjects();
  }, []);

  // Fetch students when subject changes
  const fetchStudents = async (subjectId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('enrollments')
      .select('id, student:students(id, fullname)')
      .eq('subject_id', subjectId);

    if (!error) {
      setStudents(data.map((e) => e.student));
      setGrades({});
    }
    setLoading(false);
  };

  // Handle grade input
  const handleGradeChange = (studentId, field, value) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  // Save grades to Supabase
  const saveGrades = async () => {
    setLoading(true);
    const updates = Object.entries(grades).map(([studentId, g]) => ({
      student_id: studentId,
      subject_id: selectedSubject,
      prelim: parseFloat(g.prelim) || 0,
      midterm: parseFloat(g.midterm) || 0,
      semifinal: parseFloat(g.semifinal) || 0,
      final: parseFloat(g.final) || 0,
    }));

    const { error } = await supabase.from('grades').upsert(updates, {
      onConflict: ['student_id', 'subject_id'],
    });

    setLoading(false);
    if (error) alert('Error saving grades');
    else alert('Grades saved successfully!');
  };

  // Generate AI report
  const generateAIReport = async () => {
    if (!selectedSubject) return alert('Select a subject first');
    setLoading(true);
    const analysis = await studentsAnalyzer(selectedSubject);
    setAiReport(analysis);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Grades Management</h1>

      {/* Subject Dropdown */}
      <div className="mb-4">
        <Select
          onValueChange={(value) => {
            setSelectedSubject(value);
            fetchStudents(value);
          }}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subj) => (
              <SelectItem key={subj.id} value={subj.id}>
                {subj.subject_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Students List */}
      {selectedSubject && (
        <Card>
          <CardContent className="p-4">
            {loading ? (
              <p>Loading...</p>
            ) : students.length === 0 ? (
              <p>No enrolled students found.</p>
            ) : (
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2 border">Student</th>
                    <th className="p-2 border">Prelim</th>
                    <th className="p-2 border">Midterm</th>
                    <th className="p-2 border">Semifinal</th>
                    <th className="p-2 border">Final</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="p-2 border">{student.fullname}</td>
                      {['prelim', 'midterm', 'semifinal', 'final'].map(
                        (field) => (
                          <td key={field} className="p-2 border">
                            <Input
                              type="number"
                              className="w-full"
                              value={grades[student.id]?.[field] || ''}
                              onChange={(e) =>
                                handleGradeChange(
                                  student.id,
                                  field,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Buttons */}
      {selectedSubject && (
        <div className="flex gap-3 mt-4">
          <Button onClick={saveGrades} disabled={loading}>
            💾 Save Grades
          </Button>
          <Button
            onClick={generateAIReport}
            variant="secondary"
            disabled={loading}
          >
            🤖 Generate AI Analysis Report
          </Button>
          {aiReport && (
            <PDFDownloadLink
              document={<GradesReportPDF report={aiReport} />}
              fileName="AI_Grades_Report.pdf"
            >
              <Button variant="outline">📄 Download Report</Button>
            </PDFDownloadLink>
          )}
        </div>
      )}
    </div>
  );
}
