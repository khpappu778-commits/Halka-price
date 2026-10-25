import React, { useState } from 'react';
import { Plus, ArrowUp, ArrowDown, Edit2, Trash2, Check, X, FolderTree } from 'lucide-react';
import { Category } from '../../types';
import { api } from '../../services/api';

interface CategoryManagerProps {
  categories: Category[];
  onRefreshCategories: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onRefreshCategories
}) => {
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const startAdd = () => {
    setEditingCat(null);
    setName('');
    setNameBn('');
    setSlug('');
    setIsAdding(true);
  };

  const startEdit = (cat: Category) => {
    setIsAdding(false);
    setEditingCat(cat);
    setName(cat.name);
    setNameBn(cat.name_bn || '');
    setSlug(cat.slug);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingCat(null);
    setName('');
    setNameBn('');
    setSlug('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (editingCat) {
        await api.updateCategory(editingCat.id, {
          name,
          name_bn: nameBn,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-')
        });
        setMessage('Category updated');
      } else {
        await api.createCategory({
          name,
          name_bn: nameBn,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          status: 'active',
          sort_order: categories.length + 1
        });
        setMessage('Category added');
      }
      cancelForm();
      onRefreshCategories();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await api.deleteCategory(id);
      onRefreshCategories();
      setMessage('Category deleted');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= categories.length) return;

    const list = [...categories];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    const orderedIds = list.map(c => c.id);
    try {
      await api.reorderCategories(orderedIds);
      onRefreshCategories();
    } catch (err: any) {
      alert('Failed to reorder categories');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-red-600" />
            <span>Store Categories Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, edit, delete, and change the display order of product categories
          </p>
        </div>

        {!isAdding && !editingCat && (
          <button
            onClick={startAdd}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Add / Edit Form */}
      {(isAdding || editingCat) && (
        <form onSubmit={handleSave} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              {editingCat ? `Edit Category: ${editingCat.name}` : 'New Category'}
            </span>
            <button
              type="button"
              onClick={cancelForm}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Category Name (English) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (!editingCat) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }
                }}
                placeholder="e.g. Smart Watches"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Bangla Name (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={e => setNameBn(e.target.value)}
                placeholder="যেমন: স্মার্টওয়াচ"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="smart-watches"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={cancelForm}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
            >
              {loading ? 'Saving...' : editingCat ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      )}

      {/* Categories List */}
      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                {idx + 1}
              </span>
              <div>
                <span className="font-semibold text-slate-900 text-xs">{cat.name}</span>
                {cat.name_bn && (
                  <span className="ml-2 text-xs text-slate-400">({cat.name_bn})</span>
                )}
                <span className="ml-2 font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  /{cat.slug}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={idx === 0}
                onClick={() => handleMove(idx, 'up')}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                title="Move up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={idx === categories.length - 1}
                onClick={() => handleMove(idx, 'down')}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                title="Move down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => startEdit(cat)}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded ml-1"
                title="Edit category"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                title="Delete category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
