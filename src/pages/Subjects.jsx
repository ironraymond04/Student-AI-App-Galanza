import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
    instructor: '',
  });

  const fetchSubjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('subjects').select('*');
    if (!error) setSubjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (editingSubject) {
      const { error } = await supabase
        .from('subjects')
        .update(formData)
        .eq('id', editingSubject.id);
      if (!error) {
        fetchSubjects();
        setOpen(false);
      }
    } else {
      const { error } = await supabase.from('subjects').insert([formData]);
      if (!error) {
        fetchSubjects();
        setOpen(false);
      }
    }
    setEditingSubject(null);
    setFormData({
      subject_code: '',
      subject_name: '',
      instructor: '',
    });
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
      instructor: subject.instructor,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (!error) fetchSubjects();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Subjects</h1>
      <Button onClick={() => setOpen(true)}>+ Add Subject</Button>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Code</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Instructor</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : subjects.length > 0 ? (
              subjects.map((subj) => (
                <tr key={subj.id}>
                  <td className="border px-4 py-2">{subj.id}</td>
                  <td className="border px-4 py-2">{subj.subject_code}</td>
                  <td className="border px-4 py-2">{subj.subject_name}</td>
                  <td className="border px-4 py-2">{subj.instructor}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(subj)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(subj.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No subjects found.
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
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              name="subject_code"
              placeholder="Subject Code"
              value={formData.subject_code}
              onChange={handleChange}
            />
            <Input
              name="subject_name"
              placeholder="Subject Name"
              value={formData.subject_name}
              onChange={handleChange}
            />
            <Input
              name="instructor"
              placeholder="Instructor"
              value={formData.instructor}
              onChange={handleChange}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>
              {editingSubject ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
