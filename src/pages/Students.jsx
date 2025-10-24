import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    student_number: "",
    first_name: "",
    last_name: "",
    course: "",
    year_level: "",
  });

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("students").select("*");
    if (!error) setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (editingStudent) {
      const { error } = await supabase
        .from("students")
        .update(formData)
        .eq("id", editingStudent.id);
      if (!error) {
        fetchStudents();
        setOpen(false);
      }
    } else {
      const { error } = await supabase.from("students").insert([formData]);
      if (!error) {
        fetchStudents();
        setOpen(false);
      }
    }
    setEditingStudent(null);
    setFormData({
      student_number: "",
      first_name: "",
      last_name: "",
      course: "",
      year_level: "",
    });
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_number: student.student_number,
      first_name: student.first_name,
      last_name: student.last_name,
      course: student.course,
      year_level: student.year_level,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (!error) fetchStudents();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Students</h1>
      <Button onClick={() => setOpen(true)}>+ Add Student</Button>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Student Number</th>
              <th className="border px-4 py-2">First Name</th>
              <th className="border px-4 py-2">Last Name</th>
              <th className="border px-4 py-2">Course</th>
              <th className="border px-4 py-2">Year Level</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : students.length > 0 ? (
              students.map((s) => (
                <tr key={s.id}>
                  <td className="border px-4 py-2">{s.id}</td>
                  <td className="border px-4 py-2">{s.student_number}</td>
                  <td className="border px-4 py-2">{s.first_name}</td>
                  <td className="border px-4 py-2">{s.last_name}</td>
                  <td className="border px-4 py-2">{s.course}</td>
                  <td className="border px-4 py-2">{s.year_level}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add Student"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              name="student_number"
              placeholder="Student Number"
              value={formData.student_number}
              onChange={handleChange}
            />
            <Input
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
            />
            <Input
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
            />
            <Input
              name="course"
              placeholder="Course"
              value={formData.course}
              onChange={handleChange}
            />
            <Input
              name="year_level"
              placeholder="Year Level"
              value={formData.year_level}
              onChange={handleChange}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>
              {editingStudent ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
