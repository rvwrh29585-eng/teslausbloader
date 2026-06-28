import { useState } from 'react';
import { useWraps, useFilteredWraps } from '../hooks/useWraps';
import { WrapCard } from './WrapCard';
import { SearchBar } from './SearchBar';

export function WrapBrowser() {
  const { wraps, models, loading, error } = useWraps();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWraps = useFilteredWraps(wraps, selectedModel, searchQuery);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <LoadingSpinner className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <div className="text-neutral-400">Loading wraps...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 mb-2">Failed to load wraps</p>
        <p className="text-neutral-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Custom Wraps</h2>
        <p className="text-neutral-400 text-sm max-w-2xl">
          Download PNG wrap designs for your Tesla. Copy to a USB drive in a{' '}
          <span className="text-white font-mono">Wraps/</span> folder, then apply in{' '}
          <span className="text-white">Toybox → Paint Shop → Wraps</span>.{' '}
          <a
            href="https://github.com/teslamotors/custom-wraps"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Get blank templates from Tesla
          </a>
        </p>
        <p className="text-neutral-400 text-sm max-w-2xl mt-2">
          Want to make your own?{' '}
          <a
            href="https://www.jowua-life.com/pages/jowua-wrap-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Jowua Wrap Studio
          </a>{' '}
          is an easy place to design custom wrap graphics.
        </p>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search wraps..."
      />

      {models.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedModel(null)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${selectedModel === null
                ? 'bg-red-600 text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }
            `}
          >
            All ({wraps.length})
          </button>
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${selectedModel === model.id
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }
              `}
            >
              {model.label} ({model.count})
            </button>
          ))}
        </div>
      )}

      {filteredWraps.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-800 rounded-xl">
          <p className="text-neutral-400">
            {wraps.length === 0
              ? 'No wraps yet — check back soon!'
              : 'No wraps match your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredWraps.map((wrap) => (
            <WrapCard key={wrap.id} wrap={wrap} />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
