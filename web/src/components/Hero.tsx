import { useState } from 'react';
import { InfoIcon, ChevronIcon, GitHubIcon, ExternalLinkIcon } from '../lib/icons';

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
                <img src="/locksound-logo.jpg" alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" aria-hidden />
                Tesla USB Loader
              </h1>
              <p className="text-neutral-400 mb-3 leading-relaxed">
                Browse, preview, and download custom USB files for your Tesla — lock chimes,
                ASS completion sounds, and more. Pick your favorites and save them ready for
                your Tesla USB drive.
              </p>
              <p className="text-sm text-neutral-500 mb-2">
                More USB file types (light shows, wraps, etc.) may be added here over time.
              </p>
              
              <p className="text-sm text-neutral-500 mb-4 flex items-center gap-2 flex-wrap">
                <span>200+ sounds from</span>
                <a 
                  href="https://www.notateslaapp.com/tesla-custom-lock-sounds/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  Not a Tesla App
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
                <span className="text-neutral-600">•</span>
                <span>plus community additions — unofficial browser for their curated library</span>
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
                aria-label="View project on GitHub"
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
                  <span>
                    Click the checkmark to select, then download as{' '}
                    <code className="px-1.5 py-0.5 rounded bg-neutral-700 text-white">LockChime.wav</code>{' '}
                    (lock sound) or{' '}
                    <code className="px-1.5 py-0.5 rounded bg-neutral-700 text-white">ASSChime.wav</code>{' '}
                    (summon completion)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Copy the file(s) to the <strong className="text-white">root</strong> of your USB drive (named TESLADRIVE). Both chimes can live on the same drive.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">4</span>
                  <span>Plug USB into your Tesla&apos;s glovebox port</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">5</span>
                  <span>
                    <strong className="text-white">Lock:</strong> Toybox → Boombox → Lock Sound → USB
                    <br />
                    <strong className="text-white">ASS:</strong> Controls → Autopilot → ASS → Customize Summon → Completion Sound → USB
                  </span>
                </li>
              </ol>
              <p className="mt-4 text-xs text-neutral-500">
                WAV format, under 1 MB per file. Requires Tesla with Pedestrian Warning System (2019+ models).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

