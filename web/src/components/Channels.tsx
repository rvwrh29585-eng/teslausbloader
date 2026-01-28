import { useMemo } from 'react';
import type { ProcessedSound } from '../hooks/useSounds';

interface Channel {
  id: string;
  emoji: string;
  name: string;
  keywords: string[];
  categories?: string[];
  seasonal?: {
    month: number; // 1-12
    priority: number; // Higher = more prominent
  };
  color: string;
}

const CHANNELS: Channel[] = [
  // Seasonal channels
  {
    id: 'halloween',
    emoji: '🎃',
    name: 'Spooky',
    keywords: ['ghost', 'scream', 'purge', 'scary', 'horror', 'zombie', 'monster', 'vampire', 'witch', 'skeleton', 'death', 'die', 'skull'],
    categories: ['holidays'],
    seasonal: { month: 10, priority: 10 },
    color: 'from-orange-600 to-orange-800',
  },
  {
    id: 'christmas',
    emoji: '🎄',
    name: 'Holiday',
    keywords: ['christmas', 'holiday', 'jingle', 'bells', 'santa', 'snow', 'merry', 'reindeer', 'elf', 'carol', 'deck the halls'],
    categories: ['holidays'],
    seasonal: { month: 12, priority: 10 },
    color: 'from-green-600 to-red-600',
  },
  {
    id: 'thanksgiving',
    emoji: '🦃',
    name: 'Thanksgiving',
    keywords: ['turkey', 'gobble', 'thankful', 'feast'],
    seasonal: { month: 11, priority: 8 },
    color: 'from-orange-700 to-amber-600',
  },
  {
    id: 'valentine',
    emoji: '💕',
    name: 'Love',
    keywords: ['love', 'heart', 'kiss', 'romantic', 'baby'],
    seasonal: { month: 2, priority: 8 },
    color: 'from-pink-500 to-red-500',
  },
  
  // Vibe channels (always available)
  {
    id: 'funny',
    emoji: '😂',
    name: 'Funny',
    keywords: ['laugh', 'funny', 'haha', 'doh', 'alrighty', 'quagmire', 'stewie', 'homer', 'bart', 'cartman', 'beavis', 'butthead', 'ace ventura', 'hangover', 'cornholio', 'biscuits'],
    categories: ['cartoons'],
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'scifi',
    emoji: '🚀',
    name: 'Sci-Fi',
    keywords: ['star wars', 'star trek', 'space', 'robot', 'alien', 'terminator', 'portal', 'hal', 'darth', 'lightsaber', 'phaser', 'blaster', 'r2d2', 'chewy', 'jarvis', 'defense', 'sentry', 'baymax', 'wall-e'],
    color: 'from-blue-600 to-purple-600',
  },
  {
    id: 'gaming',
    emoji: '🎮',
    name: 'Gaming',
    keywords: ['mario', 'nintendo', 'sonic', 'pokemon', 'pikachu', 'zelda', 'xbox', 'playstation', 'fortnite', 'among us', 'halo', 'doom', 'metroid', 'gamecube', 'game boy', 'coin', 'power up', '1 up', 'mortal kombat', 'street fighter', 'pac man', 'duck hunt', 'donkey kong'],
    categories: ['video-games'],
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'retro',
    emoji: '📼',
    name: 'Retro',
    keywords: ['90s', 'retro', 'aol', 'windows', 'mac', 'modem', 'icq', 'msn', 'dial', 'startup', 'intel', 'yahoo', 'skype', 'winamp', 'tivo', 'viper'],
    categories: ['retro'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'movies',
    emoji: '🎬',
    name: 'Movies',
    keywords: ['movie', 'film', 'ghostbusters', 'back to the future', 'knight rider', 'harry potter', 'hedwig', 'iron man', 'transformers', 'toy story', 'cars', 'pixar', 'disney', 'dreamworks', 'austin powers', 'terminator', 'x-files', 'addams', 'friends'],
    categories: ['shows-movies'],
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'cute',
    emoji: '🐱',
    name: 'Cute',
    keywords: ['animal', 'cat', 'dog', 'goat', 'chicken', 'rooster', 'owl', 'pig', 'frog', 'duck', 'pikachu', 'bluey', 'bingo', 'peppa', 'woody', 'meep', 'scooby', 'pooh', 'coqui'],
    color: 'from-pink-400 to-purple-400',
  },
  {
    id: 'tesla',
    emoji: '⚡',
    name: 'Tesla',
    keywords: ['tesla', 'tron', 'electric', 'ev', 'autopilot', 'cybertruck'],
    color: 'from-red-600 to-red-700',
  },
];

interface ChannelsProps {
  sounds: ProcessedSound[];
  activeChannel: string | null;
  onSelectChannel: (channelId: string | null) => void;
}

export function Channels({ sounds, activeChannel, onSelectChannel }: ChannelsProps) {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  // Calculate which channels have matching sounds and sort by relevance
  const channelsWithCounts = useMemo(() => {
    return CHANNELS.map(channel => {
      const matchingSounds = sounds.filter(sound => 
        matchesChannel(sound, channel)
      );
      
      // Boost seasonal channels during their month
      const seasonalBoost = channel.seasonal?.month === currentMonth 
        ? channel.seasonal.priority 
        : 0;
      
      return {
        ...channel,
        count: matchingSounds.length,
        seasonalBoost,
        isCurrentSeason: channel.seasonal?.month === currentMonth,
      };
    })
    .filter(c => c.count > 0) // Only show channels with sounds
    .sort((a, b) => {
      // Seasonal channels first during their month
      if (a.seasonalBoost !== b.seasonalBoost) {
        return b.seasonalBoost - a.seasonalBoost;
      }
      // Then by count
      return b.count - a.count;
    });
  }, [sounds, currentMonth]);

  if (channelsWithCounts.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-medium text-neutral-400">Channels</h2>
        {activeChannel && (
          <button
            onClick={() => onSelectChannel(null)}
            className="text-xs text-neutral-500 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {channelsWithCounts.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onSelectChannel(activeChannel === channel.id ? null : channel.id)}
            className={`
              relative flex items-center gap-2 px-3 py-2 rounded-xl
              transition-all duration-200 
              hover:scale-105 active:scale-95
              ${activeChannel === channel.id
                ? `bg-gradient-to-r ${channel.color} text-white shadow-lg`
                : channel.isCurrentSeason
                  ? `bg-gradient-to-r ${channel.color} text-white opacity-90 hover:opacity-100 ring-2 ring-white/20`
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
              }
            `}
          >
            <span className="text-xl">{channel.emoji}</span>
            <span className="text-sm font-medium">{channel.name}</span>
            <span className={`
              text-xs px-1.5 py-0.5 rounded-full
              ${activeChannel === channel.id || channel.isCurrentSeason
                ? 'bg-white/20'
                : 'bg-neutral-700'
              }
            `}>
              {channel.count}
            </span>
            
            {/* Seasonal glow effect */}
            {channel.isCurrentSeason && activeChannel !== channel.id && (
              <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse pointer-events-none" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper function to check if a sound matches a channel
function matchesChannel(sound: ProcessedSound, channel: Channel): boolean {
  const searchText = `${sound.displayName} ${sound.category} ${sound.name}`.toLowerCase();
  
  // Check keywords
  const keywordMatch = channel.keywords.some(keyword => 
    searchText.includes(keyword.toLowerCase())
  );
  
  // Check categories
  const categoryMatch = channel.categories?.some(cat => 
    sound.category.toLowerCase().includes(cat.toLowerCase())
  );
  
  return keywordMatch || categoryMatch || false;
}

// Export for use in filtering
export function getChannelSounds(sounds: ProcessedSound[], channelId: string): ProcessedSound[] {
  const channel = CHANNELS.find(c => c.id === channelId);
  if (!channel) return sounds;
  
  return sounds.filter(sound => matchesChannel(sound, channel));
}
