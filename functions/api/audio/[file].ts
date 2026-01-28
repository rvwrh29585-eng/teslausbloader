// Cloudflare Pages Function: GET /api/audio/:file
// Serves audio files from GitHub first, fallback to notateslaapp.com

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/rvwrh29585-eng/teslausbloader/main/sounds';

export const onRequestGet: PagesFunction = async (context) => {
  const { file } = context.params;
  
  if (!file || typeof file !== 'string') {
    return new Response('File parameter required', { status: 400 });
  }
  
  // Decode and sanitize filename
  const filename = decodeURIComponent(file);
  
  // Validate filename (prevent path traversal)
  if (filename.includes('..') || filename.includes('/')) {
    return new Response('Invalid filename', { status: 400 });
  }
  
  // Ensure .wav extension
  const wavFilename = filename.endsWith('.wav') ? filename : `${filename}.wav`;
  
  // Try GitHub first (our cached copy)
  try {
    const githubUrl = `${GITHUB_RAW_BASE}/${encodeURIComponent(wavFilename)}`;
    const response = await fetch(githubUrl);
    
    if (response.ok) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'audio/wav',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
          'X-Source': 'github',
        },
      });
    }
  } catch {
    // GitHub failed, try fallback
  }
  
  // Fallback: Try notateslaapp.com for new sounds not yet in our repo
  const baseName = wavFilename.replace(/\.wav$/i, '');
  const possiblePaths = [
    `/assets/audio/cartoons/${baseName}.wav`,
    `/assets/audio/video-games/${baseName}.wav`,
    `/assets/audio/shows-movies/${baseName}.wav`,
    `/assets/audio/retro/${baseName}.wav`,
    `/assets/audio/others/${baseName}.wav`,
    `/assets/audio/${baseName}.wav`,
  ];
  
  for (const path of possiblePaths) {
    try {
      const response = await fetch(`https://www.notateslaapp.com${path}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TeslaLockSoundLoader/1.0)',
        },
      });
      
      if (response.ok) {
        return new Response(response.body, {
          headers: {
            'Content-Type': 'audio/wav',
            'Cache-Control': 'public, max-age=86400', // Cache for 1 day (might be new)
            'Access-Control-Allow-Origin': '*',
            'X-Source': 'notateslaapp',
          },
        });
      }
    } catch {
      continue;
    }
  }
  
  return new Response('Audio file not found', { status: 404 });
};
