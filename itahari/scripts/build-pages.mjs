// GitHub Pages adapter. Existing source, dist, metadata, and SEO files stay untouched.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function parsePagesUrl(value) {
  assert(value, 'PAGES_BASE_URL must be set to the configure-pages base_url output.');
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', 'GitHub Pages must use HTTPS.');
  assert(!url.username && !url.password && !url.search && !url.hash, 'Pages URL must not contain credentials, a query, or a fragment.');
  const basePath = url.pathname.replace(/\/+$/, '');
  return {baseUrl: url.origin + basePath, basePath};
}

export function prefixLocalUrls(html, basePath) {
  if (!basePath) return html;
  // Cover navigation, CSS, JS, images, icons, and the gallery's image URLs.
  // Keep external URLs, metadata, fragments, phone links, and menu routes intact.
  return html.replace(/\b(href|src|data-photo)=(['"])\/(?!\/)([^'"]*)\2/g,
    (_, name, quote, rest) => `${name}=${quote}${basePath}/${rest}${quote}`);
}

async function walk(directory) {
  const entries = await fs.readdir(directory, {withFileTypes: true});
  const groups = await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  }));
  return groups.flat();
}

export async function buildPages(value) {
  const {baseUrl, basePath} = parsePagesUrl(value);
  const staging = await fs.mkdtemp(path.join(os.tmpdir(), 'bahattar-pages-'));
  for (const directory of ['src', 'public', 'scripts']) {
    await fs.cp(path.join(root, directory), path.join(staging, directory), {recursive: true});
  }
  await fs.mkdir(path.join(staging, 'docs'));
  await fs.copyFile(path.join(root, 'docs/supplied-menu-reference.json'), path.join(staging, 'docs/supplied-menu-reference.json'));
  await fs.copyFile(path.join(root, 'package.json'), path.join(staging, 'package.json'));

  for (const command of ['build.mjs', 'check.mjs']) {
    execFileSync(process.execPath, [path.join(staging, 'scripts', command)], {
      cwd: staging,
      env: {...process.env, SITE_URL: baseUrl},
      stdio: 'inherit'
    });
  }

  const artifactPath = path.join(staging, 'dist');
  const files = await walk(artifactPath);
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  const documents = new Map();
  for (const file of htmlFiles) {
    const original = await fs.readFile(file, 'utf8');
    const html = prefixLocalUrls(original, basePath);
    await fs.writeFile(file, html);
    documents.set(file, html);
    assert(html.includes(`href="${baseUrl}/`), `Missing production URLs: ${file}`);
    assert(html.includes('name="robots" content="index,follow"'), `Preview-only SEO metadata: ${file}`);
  }

  // Validate the actual uploaded HTML after subdirectory adaptation.
  let checked = 0;
  for (const [file, html] of documents) {
    for (const match of html.matchAll(/\b(?:href|src|data-photo)="(\/(?!\/)[^"]*)"/g)) {
      const localUrl = new URL(match[1].replaceAll('&amp;', '&'), baseUrl);
      assert(!basePath || localUrl.pathname.startsWith(basePath + '/'), `URL escapes the Pages base path: ${match[1]}`);
      const relative = decodeURIComponent(localUrl.pathname.slice(basePath.length));
      let target = path.resolve(artifactPath, '.' + relative);
      assert(target.startsWith(artifactPath + path.sep) || target === artifactPath, 'Artifact path traversal');
      const stat = await fs.stat(target);
      if (stat.isDirectory()) target = path.join(target, 'index.html');
      await fs.access(target);
      if (localUrl.hash && documents.has(target)) {
        assert(documents.get(target).includes(`id="${decodeURIComponent(localUrl.hash.slice(1))}"`), `Broken anchor in ${file}: ${match[1]}`);
      }
      checked++;
    }
  }
  const sitemap = await fs.readFile(path.join(artifactPath, 'sitemap.xml'), 'utf8');
  assert(!sitemap.includes('localhost'), 'Sitemap contains preview URLs');
  for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) assert(match[1].startsWith(baseUrl + '/'), 'Sitemap URL uses the wrong site root');
  const robots = await fs.readFile(path.join(artifactPath, 'robots.txt'), 'utf8');
  assert(robots.includes(`Sitemap: ${baseUrl}/sitemap.xml`), 'Wrong robots sitemap URL');
  assert(robots.includes('Allow: /'), 'Production robots remains blocked');
  assert(files.some(file => file === path.join(artifactPath, '404.html')), 'Missing custom 404');
  console.log(`GitHub Pages artifact validated: ${htmlFiles.length} pages, ${checked} local URLs, base ${baseUrl}`);
  return artifactPath;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const artifactPath = await buildPages(process.env.PAGES_BASE_URL);
  if (process.env.GITHUB_OUTPUT) await fs.appendFile(process.env.GITHUB_OUTPUT, `artifact_path=${artifactPath}\n`);
  console.log(`Artifact directory: ${artifactPath}`);
}
