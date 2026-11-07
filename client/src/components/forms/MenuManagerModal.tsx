import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { MenuCategory, DietaryTag } from '../../types/index.js';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cafe-deep/50 backdrop-blur-sm">
      <div className="bg-cafe-card rounded-3xl max-w-md w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] border border-cafe-border text-cafe-text transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-cafe-border">
          <h3 className="font-bold text-base text-cafe-text">Add New Menu Item</h3>
          <button onClick={onClose} className="touch-target w-9 h-9 rounded-full flex items-center justify-center text-cafe-muted hover:bg-cafe-cream">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
          <div>
            <label className="font-bold text-cafe-text block mb-1">Item Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Traditional Buna" className="w-full px-3 py-2 border border-cafe-border bg-cafe-cream text-cafe-text rounded-xl font-medium focus:outline-none focus:border-cafe-amber" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-cafe-text block mb-1">Price (ETB)</label>
              <input required type="number" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="130" className="w-full px-3 py-2 border border-cafe-border bg-cafe-cream text-cafe-text rounded-xl font-medium focus:outline-none focus:border-cafe-amber" />
            </div>
            <div>
              <label className="font-bold text-cafe-text block mb-1">Prep Time (min)</label>
              <input type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="w-full px-3 py-2 border border-cafe-border bg-cafe-cream text-cafe-text rounded-xl font-medium focus:outline-none focus:border-cafe-amber" />
            </div>
          </div>
          <div>
            <label className="font-bold text-cafe-text block mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as MenuCategory)} className="w-full px-3 py-2 border border-cafe-border bg-cafe-cream text-cafe-text rounded-xl font-bold focus:outline-none focus:border-cafe-amber">
              {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="font-bold text-cafe-text block mb-1">Dietary Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map((tag) => (
                <button type="button" key={tag} onClick={() => toggleTag(tag)} className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] ${dietaryTags.includes(tag) ? 'bg-cafe-amber text-white border-cafe-amber' : 'bg-cafe-cream text-cafe-muted border-cafe-border'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-bold text-cafe-text block mb-1">Photo Image URL</label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-cafe-border bg-cafe-cream text-cafe-text rounded-xl focus:outline-none focus:border-cafe-amber" />
          </div>
          <div>
            <label className="font-bold text-cafe-text block mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Ingredients and details..." className="w-full px-3 py-2 border border-cafe-border bg-cafe-cream text-cafe-text rounded-xl focus:outline-none focus:border-cafe-amber" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full touch-target min-h-[44px] py-3 bg-cafe-amber hover:bg-cafe-amber-hover text-white font-bold rounded-xl mt-4 shadow-sm transition-colors">
            {isSubmitting ? 'Saving...' : 'Add Item to Menu'}
          </button>
        </form>
      </div>
    </div>
  );
};
