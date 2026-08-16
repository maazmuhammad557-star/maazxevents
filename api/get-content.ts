import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list } from '@vercel/blob';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Support CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    return res.status(200).json({ error: 'BLOB_READ_WRITE_TOKEN not configured' });
  }

  try {
    const { blobs } = await list({ token: blobToken });
    const contentBlob = blobs.find((b) => b.pathname === 'content.json');
    
    if (!contentBlob) {
      return res.status(404).json({ error: 'content.json not found in Blob storage' });
    }

    // Redirect to the direct public CDN URL of content.json so it loads extremely fast
    // and is cached by Vercel's Edge Network, bypassing Serverless Function computation!
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.redirect(307, `${contentBlob.url}?t=${Date.now()}`);
  } catch (error: any) {
    console.error('Failed to list blobs:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve content' });
  }
}
