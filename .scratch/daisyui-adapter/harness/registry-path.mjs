import { join } from 'node:path';

export const registryFile = (dir, url) =>
	join(dir, decodeURIComponent(url ?? '').replace(/^\/r\//, ''));
