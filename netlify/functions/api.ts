import serverless from 'serverless-http';
import app from '../../server/app';

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // Normalize path so Express router routes (mounted at /api/*) always match
  let requestPath = event.path || '';
  if (requestPath.startsWith('/.netlify/functions/api')) {
    requestPath = requestPath.replace('/.netlify/functions/api', '/api');
  } else if (!requestPath.startsWith('/api')) {
    requestPath = `/api${requestPath.startsWith('/') ? '' : '/'}${requestPath}`;
  }
  event.path = requestPath;

  return serverlessHandler(event, context);
};
