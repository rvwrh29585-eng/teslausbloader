// Cloudflare Pages Function: GET /api/wrap/:model/:file
// Serves wrap images from GitHub wraps/{model}/{file}

const GITHUB_RAW = 'https://raw.githubusercontent.com/rvwrh29585-eng/teslausbloader/main/wraps';

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

export const onRequestGet: PagesFunction = async (context) => {
  const { model, file } = context.params;

  if (!model || typeof model !== 'string' || !file || typeof file !== 'string') {
    return new Response('Model and file required', { status: 400 });
  }

  const modelId = decodeURIComponent(model);
  const filename = decodeURIComponent(file);

  if (
    modelId.includes('..') ||
    filename.includes('..') ||
    modelId.includes('/') ||
    filename.includes('/')
  ) {
    return new Response('Invalid path', { status: 400 });
  }

  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return new Response('Unsupported file type', { status: 400 });
  }

  const githubUrl = `${GITHUB_RAW}/${encodeURIComponent(modelId)}/${encodeURIComponent(filename)}`;

  try {
    const response = await fetch(githubUrl);
    if (!response.ok) {
      return new Response('Wrap file not found', { status: 404 });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'X-Source': 'github',
      },
    });
  } catch {
    return new Response('Failed to fetch wrap file', { status: 502 });
  }
};
