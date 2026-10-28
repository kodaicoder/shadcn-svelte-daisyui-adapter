import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

export const REGISTRY_PORT = 5199;

const registryFile = (dir, url) => {
	const root = resolve(dir);
	const file = resolve(root, decodeURIComponent(url ?? '').replace(/^\/r\//, ''));
	return file === root || file.startsWith(root + sep) ? file : null;
};

export const serveRegistry = (dir, req, res) => {
	const file = registryFile(dir, req.url);
	if (!file) {
		res.writeHead(400).end('bad path');
		return;
	}
	console.log(`${req.method} ${req.url} -> ${file}`);
	if (!existsSync(file) || extname(file) !== '.json') {
		res.writeHead(404).end('not found');
		return;
	}
	res.writeHead(200, { 'content-type': 'application/json' }).end(readFileSync(file));
};

export const startRegistry = (dir, port = REGISTRY_PORT) =>
	new Promise((ready) => {
		const server = createServer((req, res) => serveRegistry(dir, req, res));
		server.listen(port, '127.0.0.1', () => ready(server));
	});

export const stopRegistry = (server) => {
	if (!server) return null;
	server.closeAllConnections();
	server.close();
	return null;
};
