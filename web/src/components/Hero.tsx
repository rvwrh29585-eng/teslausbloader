import { useState } from 'react';

export function Hero() {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-red-950/30 border border-neutral-800 p-6 md:p-8">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="max-w-2xl">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                Tesla Lock Sound Loader
              </h1>
              <p className="text-neutral-400 mb-4 leading-relaxed">
                Customize your Tesla's lock chime with 200+ sounds from movies, video games, 
                TV shows, and more. Preview, pick your favorite, and download it ready 
                for your Tesla.
              </p>
              
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <InfoIcon className="w-4 h-4" />
                {showInstructions ? 'Hide instructions' : 'How does this work?'}
                <ChevronIcon className={`w-4 h-4 transition-transform ${showInstructions ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/rvwrh29585-eng/teslausbloader"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                title="View on GitHub"
              >
                <GitHubIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {showInstructions && (
            <div className="mt-6 p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-lg">📋</span>
                Quick Setup Guide
              </h3>
              <ol className="space-y-2 text-sm text-neutral-300">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Browse and preview sounds until you find one you love</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Click the checkmark to select it, then download as <code className="px-1.5 py-0.5 rounded bg-neutral-700 text-white">LockChime.wav</code></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Copy the file to the <strong className="text-white">root</strong> of your USB drive (named TESLADRIVE)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">4</span>
                  <span>Plug USB into your Tesla's glovebox port</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">5</span>
                  <span>Go to <strong className="text-white">Toybox → Boombox → Lock Sound → USB</strong></span>
                </li>
              </ol>
              <p className="mt-4 text-xs text-neutral-500">
                Requires Tesla with Pedestrian Warning System speaker (2019+ models)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
