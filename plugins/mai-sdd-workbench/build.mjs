import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';

await build({ entryPoints: ['src/client.jsx'], outfile: 'client.js', bundle: true, format: 'iife', platform: 'browser', target: 'es2022', external: ['react'], minify: true, legalComments: 'inline' });
await writeFile('THIRD_PARTY_NOTICES.md', '# Bundled dependency notices\n\n## marked 18.0.11\n\n' + await readFile('node_modules/marked/LICENSE', 'utf8'));
