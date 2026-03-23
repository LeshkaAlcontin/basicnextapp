// app/dashboard/medicaltests/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  getMedicalTests, 
  createMedicalTest, 
  updateMedicalTest, 
  deleteMedicalTest, 
  getUoms, 
  getTestCategories,
  MedicalTest,
  UomOption,
  CategoryOption
} from './actions';

export default function MedicalTestsPage() {
  const [tests, setTests] = useState<MedicalTest[]>([]);
  const [uoms, setUoms] = useState<UomOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iduom: '',
    idcategory: '',
    normalmin: '',
    normalmax: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const data = await getMedicalTests();
      setTests(data);
    } catch (error) {
      setMessage('Error fetching medical tests');
      console.error(error);
    }
    setLoading(false);
  };

  const fetchOptions = async () => {
    try {
      const [uomsData, categoriesData] = await Promise.all([
        getUoms(),
        getTestCategories(),
      ]);
      setUoms(uomsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      iduom: parseInt(formData.iduom),
      idcategory: parseInt(formData.idcategory),
      normalmin: formData.normalmin ? parseFloat(formData.normalmin) : null,
      normalmax: formData.normalmax ? parseFloat(formData.normalmax) : null,
    };

    let result;
    if (editingId) {
      result = await updateMedicalTest(editingId, payload);
    } else {
      result = await createMedicalTest(payload);
    }

    if (result.error) {
      setMessage(`Error: ${result.error}`);
    } else {
      setMessage(editingId ? 'Updated successfully!' : 'Created successfully!');
      setFormData({ name: '', description: '', iduom: '', idcategory: '', normalmin: '', normalmax: '' });
      setEditingId(null);
      fetchTests();
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    setLoading(true);
    const result = await deleteMedicalTest(id);
    if (result.error) {
      setMessage(`Error: ${result.error}`);
    } else {
      setMessage('Deleted successfully!');
      fetchTests();
    }
    setLoading(false);
  };

  const handleEdit = (test: MedicalTest) => {
    setFormData({
      name: test.name,
      description: test.description || '',
      iduom: test.iduom?.toString() || '',
      idcategory: test.idcategory?.toString() || '',
      normalmin: test.normalmin?.toString() || '',
      normalmax: test.normalmax?.toString() || '',
    });
    setEditingId(test.id);
  };

  const filteredTests = tests.filter(test =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (test.category_name && test.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Medical Tests Management</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by test name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          disabled={loading}
        />
      </div>

      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Medical Test' : 'Create New Medical Test'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Test Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              maxLength={50}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              required
              value={formData.idcategory}
              onChange={(e) => setFormData({ ...formData, idcategory: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Unit of Measure *</label>
            <select
              required
              value={formData.iduom}
              onChange={(e) => setFormData({ ...formData, iduom: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              <option value="">Select UOM</option>
              {uoms.map((uom) => (
                <option key={uom.id} value={uom.id}>
                  {uom.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Normal Min</label>
              <input
                type="number"
                step="any"
                value={formData.normalmin}
                onChange={(e) => setFormData({ ...formData, normalmin: e.target.value })}
                className="w-full p-2 border rounded"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Normal Max</label>
              <input
                type="number"
                step="any"
                value={formData.normalmax}
                onChange={(e) => setFormData({ ...formData, normalmax: e.target.value })}
                className="w-full p-2 border rounded"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Processing...' : (editingId ? 'Update' : 'Create')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', description: '', iduom: '', idcategory: '', normalmin: '', normalmax: '' });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {message && (
        <div className={`mb-4 p-2 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Test Name</th>
              <th className="border p-2 text-left">Category</th>
              <th className="border p-2 text-left">Unit</th>
              <th className="border p-2 text-left">Normal Range</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="border p-2">{test.id}</td>
                <td className="border p-2">{test.name}</td>
                <td className="border p-2">{test.category_name || 'N/A'}</td>
                <td className="border p-2">{test.uom_name || 'N/A'}</td>
                <td className="border p-2">
                  {test.normalmin && test.normalmax 
                    ? `${test.normalmin} - ${test.normalmax}` 
                    : test.normalmin ? `${test.normalmin} - ` 
                    : test.normalmax ? `- ${test.normalmax}`
                    : 'Not specified'}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(test)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(test.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}