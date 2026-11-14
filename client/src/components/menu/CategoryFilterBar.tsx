import React from 'react';
import { Search } from 'lucide-react';
import { MenuCategory } from '../../types/index.js';

interface CategoryFilterBarProps {
  categories: Array<MenuCategory | 'All'>;
  activeCategory: MenuCategory | 'All';
  onSelectCategory: (cat: MenuCategory | 'All') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="space-y-3 mb-6 transition-colors">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cafe-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search food, desserts, or Ethiopian coffee..."
          className="w-full pl-10 pr-4 py-2.5 bg-cafe-card border border-cafe-border rounded-xl text-sm text-cafe-text placeholder-cafe-muted focus:outline-none focus:border-cafe-amber focus:ring-1 focus:ring-cafe-amber shadow-sm transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none -mx-1 px-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`shrink-0 inline-flex items-center justify-center min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all text-center select-none ${
                isActive
                  ? 'bg-cafe-amber text-white shadow-sm'
                  : 'bg-cafe-card text-cafe-muted border border-cafe-border hover:bg-cafe-cream hover:text-cafe-text'
              }`}
            >
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
