import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.woff2': 'font/woff2',
	'.woff': 'font/woff',
	'.ttf': 'font/ttf',
	'.ico': 'image/x-icon',
	'.txt': 'text/plain; charset=utf-8'
};

// A static build answers a router path from index.html, so an unknown path is not an error.
export const resolveRequest = (dir, pathname) => {
	const base = resolve(dir);
	const target = resolve(base, `.${pathname}`);
	if (target !== base && !target.startsWith(base + sep)) return null;
	if (existsSync(target) && statSync(target).isFile()) return target;
	const index = join(base, 'index.html');
	return existsSync(index) ? index : null;
};

export const serve = (dir, port) => {
	const server = createServer((request, response) => {
		let pathname;
		try {
			pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
		} catch {
			response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
			response.end('bad request');
			return;
		}
		const file = resolveRequest(dir, pathname);
		if (!file) {
			response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
			response.end('not found');
			return;
		}
		response.writeHead(200, {
			'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream'
		});
		response.end(readFileSync(file));
	});
	server.listen(port, '127.0.0.1', () => console.log(`serve  http://127.0.0.1:${port}/`));
	return server;
};
