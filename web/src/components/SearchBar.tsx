import { SearchIcon, XIcon } from '../lib/icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search sounds..." }: SearchBarProps) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-4 py-3 rounded-xl
          bg-neutral-900 border border-neutral-800
          text-white placeholder-neutral-500
          focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500
          transition-all
        "
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
        >
          <XIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

