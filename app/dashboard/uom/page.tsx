// app/dashboard/uom/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getUoms, createUom, updateUom, deleteUom } from './actions';

interface Uom {
  id: number;
  name: string;
  description: string | null;
}

export default function UomPage() {
  const [uoms, setUoms] = useState<Uom[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUoms = async () => {
    setLoading(true);
    try {
      const data = await getUoms();
      setUoms(data);
    } catch (error) {
      setMessage('Error fetching UOMs');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUoms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    let result;
    if (editingId) {
      result = await updateUom(editingId, formData);
    } else {
      result = await createUom(formData);
    }

    if (result.error) {
      setMessage(`Error: ${result.error}`);
    } else {
      setMessage(editingId ? 'Updated successfully!' : 'Created successfully!');
      setFormData({ name: '', description: '' });
      setEditingId(null);
      fetchUoms();
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    setLoading(true);
    const result = await deleteUom(id);
    if (result.error) {
      setMessage(`Error: ${result.error}`);
    } else {
      setMessage('Deleted successfully!');
      fetchUoms();
    }
    setLoading(false);
  };

  const handleEdit = (uom: Uom) => {
    setFormData({ name: uom.name, description: uom.description || '' });
    setEditingId(uom.id);
  };

  const filteredUoms = uoms.filter(uom =>
    uom.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Units of Measure Management</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          disabled={loading}
        />
      </div>

      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit UOM' : 'Create New UOM'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              maxLength={15}
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
                  setFormData({ name: '', description: '' });
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
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUoms.map((uom) => (
              <tr key={uom.id} className="hover:bg-gray-50">
                <td className="border p-2">{uom.id}</td>
                <td className="border p-2">{uom.name}</td>
                <td className="border p-2">{uom.description}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(uom)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(uom.id)}
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