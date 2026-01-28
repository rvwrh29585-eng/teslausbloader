// Cloudflare Pages Function: GET /api/audio/:file
// Proxies audio files from notateslaapp.com

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
  
  // Extract the base name without extension
  const baseName = filename.replace(/\.wav$/i, '');
  
  // Determine the category path from the filename
  // Files are stored in /assets/audio/category/name.wav on the source site
  // We need to figure out the category from the filename
  // Format: category_soundname.wav -> /assets/audio/category/category_soundname.wav
  // But some are in subdirectories like: cartoons/pokemon_pikachu.wav
  
  // Try multiple possible paths
  const possiblePaths = [
    // Try with category prefix in path
    `/assets/audio/cartoons/${baseName}.wav`,
    `/assets/audio/video-games/${baseName}.wav`,
    `/assets/audio/shows-movies/${baseName}.wav`,
    `/assets/audio/retro/${baseName}.wav`,
    `/assets/audio/others/${baseName}.wav`,
    // Direct path
    `/assets/audio/${baseName}.wav`,
  ];
  
  let audioResponse: Response | null = null;
  
  for (const path of possiblePaths) {
    try {
      const response = await fetch(`https://www.notateslaapp.com${path}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TeslaLockSoundLoader/1.0)',
        },
      });
      
      if (response.ok) {
        audioResponse = response;
        break;
      }
    } catch {
      continue;
    }
  }
  
  if (!audioResponse) {
    return new Response('Audio file not found', { status: 404 });
  }
  
  // Stream the audio file back with proper headers
  return new Response(audioResponse.body, {
    headers: {
      'Content-Type': 'audio/wav',
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      'Access-Control-Allow-Origin': '*',
    },
  });
};
