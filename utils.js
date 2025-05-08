export const decodeText = (text) =>
  Buffer.from(text || '', 'base64').toString('utf-8');
