import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { MenuCategory, DietaryTag, MenuItem } from '../../types/index.js';

interface MenuManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemSaved: () => void;
}

const CATEGORIES: MenuCategory[] = ['Starters', 'Main Dishes', 'Desserts', 'Hot Drinks', 'Cold Drinks'];
const DIETARY_OPTIONS: DietaryTag[] = ['Vegetarian', 'Vegan', 'Spicy', 'Gluten-Free'];

export const MenuManagerModal: React.FC<MenuManagerModalProps> = ({ isOpen, onClose, onItemSaved }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<MenuCategory>('Main Dishes');
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: DietaryTag) => {
    setDietaryTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setIsSubmitting(true);
    try {
      await api.post('/menu', {
        name,
        description,
        price: Number(price),
        category,
        dietaryTags,
        imageUrl,
        basePrepTimeMinutes: Number(prepTime) || 15,
      });
      onItemSaved();
      onClose();
    } catch (err) {
      console.error('Failed to create menu item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="font-bold text-base text-gray-900">Add New Menu Item</h3>
          <button onClick={onClose} className="touch-target w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Item Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Avocado Toast" className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Price ($)</label>
              <input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="9.50" className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Prep Time (min)</label>
              <input type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as MenuCategory)} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white">
              {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Dietary Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map((tag) => (
                <button type="button" key={tag} onClick={() => toggleTag(tag)} className={`px-2.5 py-1 rounded-lg border ${dietaryTags.includes(tag) ? 'bg-amber-600 text-white border-amber-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Photo Image URL</label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Ingredients and details..." className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full touch-target py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl mt-4 shadow-sm transition-colors">
            {isSubmitting ? 'Saving...' : 'Add Item to Menu'}
          </button>
        </form>
      </div>
    </div>
  );
};
