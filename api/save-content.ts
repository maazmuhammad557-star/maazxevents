import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Support CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(451).json({ error: 'Method not allowed' });
  }

  // Authorize request
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    return res.status(500).json({ 
      error: 'Vercel Blob token is missing. Please create a Blob store in your Vercel project dashboard.' 
    });
  }

  try {
    // Upload content.json to Vercel Blob with constant file name (no suffix)
    const blob = await put('content.json', JSON.stringify(content, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      token: blobToken,
    });

    return res.status(200).json({ success: true, url: blob.url });
  } catch (error: any) {
    console.error('Vercel Blob upload failed:', error);
    return res.status(500).json({ error: error.message || 'Vercel Blob upload failed' });
  }
}
