// Generate ready-to-publish files for Pages → Deploy from a branch.
// No workflow or remote operation is involved.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildPages} from './build-pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteUrl = process.env.SITE_URL || 'https://isthisnewhere-wq.github.io/itahari-';
const built = await buildPages(siteUrl);
await fs.mkdir(path.join(root, 'artifacts'), {recursive:true});
const destination = process.argv[2]
  ? path.resolve(process.argv[2])
  : await fs.mkdtemp(path.join(root, 'artifacts', 'branch-site-'));
// Copy finished website files only. Preserve all unrelated repository files.
await fs.cp(built, destination, {
  recursive:true,
  filter: source => path.basename(source) !== 'pages.json'
});
await fs.writeFile(path.join(destination, '.nojekyll'), '');
console.log(`Branch publishing files: ${destination}`);
console.log('Pages settings: Deploy from a branch → main → /(root).');

