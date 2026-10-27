import React from 'react';
import { Plus, Clock } from 'lucide-react';
import { MenuItem } from '../../types/index.js';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${
        !item.isAvailable ? 'opacity-60 bg-gray-50' : ''
      }`}
    >
      <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No Photo Available
          </div>
        )}

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full tracking-wider shadow">
              Sold Out
            </span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
          {item.dietaryTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-0.5 rounded-md shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-base leading-snug">{item.name}</h3>
            <span className="font-bold text-amber-700 text-base whitespace-nowrap">
              ${item.price.toFixed(2)}
            </span>
          </div>
          {item.description && (
            <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {item.basePrepTimeMinutes} min
          </span>

          <button
            onClick={() => onAddToCart(item)}
            disabled={!item.isAvailable}
            className="touch-target px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
            aria-label={`Add ${item.name} to order`}
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
