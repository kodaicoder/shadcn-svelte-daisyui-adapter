import { resolve } from 'node:path';
import { startRegistry, REGISTRY_PORT } from '../harness/registry.mjs';

const dir = resolve(process.argv[2] ?? '.scratch/daisyui-adapter/registry/r');

await startRegistry(dir);
console.log(`registry ${dir} on http://127.0.0.1:${REGISTRY_PORT}`);
