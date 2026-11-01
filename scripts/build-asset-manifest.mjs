import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('assets');
const supported = /\.(png|jpe?g|webp|gif|avif|mp3|wav|ogg|opus|m4a|aac)$/i;
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : supported.test(entry.name) ? [full] : [];
  }));
  return nested.flat();
}
const files = (await walk(root)).map((file) => path.relative(process.cwd(), file).split(path.sep).join('/')).sort();
await writeFile('js/core/asset-manifest.json', `${JSON.stringify(files, null, 2)}\n`);
console.log(`Asset manifest rebuilt: ${files.length} files`);
