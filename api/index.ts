import app from '../server/app';

// Export Express app wrapped as resilient Vercel Serverless Function handler
export default async function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('❌ Vercel Serverless Function Error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: err?.message || 'Internal Server Error',
      });
    }
  }
}
