import { createHash } from 'node:crypto';

export const hashOf = (text) => createHash('sha256').update(text).digest('hex');
