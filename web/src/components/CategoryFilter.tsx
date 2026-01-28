import { formatCategoryName } from '../lib/api';

interface Category {
  name: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`
          px-3 py-1.5 rounded-full text-sm font-medium transition-all
          ${selected === null
            ? 'bg-red-600 text-white'
            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
          }
        `}
      >
        All ({categories.reduce((sum, c) => sum + c.count, 0)})
      </button>
      
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => onSelect(category.name)}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-all
            ${selected === category.name
              ? 'bg-red-600 text-white'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
            }
          `}
        >
          {formatCategoryName(category.name)} ({category.count})
        </button>
      ))}
    </div>
  );
}
