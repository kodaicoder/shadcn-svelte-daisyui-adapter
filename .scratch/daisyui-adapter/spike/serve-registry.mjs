import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { registryFile } from '../harness/registry-path.mjs';

const dir = resolve(process.argv[2] ?? '.scratch/daisyui-adapter/registry/r');
const port = 5199;

createServer((req, res) => {
	const file = registryFile(dir, req.url);
	console.log(`${req.method} ${req.url} -> ${file}`);
	if (!existsSync(file) || extname(file) !== '.json') {
		res.writeHead(404).end('not found');
		return;
	}
	res.writeHead(200, { 'content-type': 'application/json' }).end(readFileSync(file));
}).listen(port, '127.0.0.1', () => console.log(`registry ${dir} on http://127.0.0.1:${port}`));
