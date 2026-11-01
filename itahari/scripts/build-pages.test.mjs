import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildPages, parsePagesUrl, prefixLocalUrls} from './build-pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Pages URL supports project paths, user sites, and custom domains', () => {
  assert.deepEqual(parsePagesUrl('https://owner.github.io/cafe/'), {baseUrl:'https://owner.github.io/cafe',basePath:'/cafe'});
  assert.deepEqual(parsePagesUrl('https://owner.github.io/'), {baseUrl:'https://owner.github.io',basePath:''});
  assert.deepEqual(parsePagesUrl('https://cafe.example/'), {baseUrl:'https://cafe.example',basePath:''});
  for (const value of ['', 'http://owner.github.io', 'https://owner.github.io/?bad=1']) assert.throws(() => parsePagesUrl(value));
});

test('subpath adaptation retains external links, metadata, and fragments', () => {
  const html = '<a href="/menu/#momo">Menu</a><img src="/assets/food.webp"><button data-photo="/assets/coffee.webp"></button><a href="#main">Skip</a><a href="tel:+9779820347351">Call</a><a href="https://maps.google.com/">Map</a><link rel="canonical" href="https://owner.github.io/cafe/menu/"><a href="//example.com/">External</a>';
  const adapted = prefixLocalUrls(html, '/cafe');
  assert(adapted.includes('href="/cafe/menu/#momo"'));
  assert(adapted.includes('src="/cafe/assets/food.webp"'));
  assert(adapted.includes('data-photo="/cafe/assets/coffee.webp"'));
  for (const url of ['#main', 'tel:+9779820347351', 'https://maps.google.com/', 'https://owner.github.io/cafe/menu/', '//example.com/']) assert(adapted.includes(`href="${url}"`));
  assert.equal(prefixLocalUrls(html, ''), html);
});

async function hashExistingFiles() {
  const hashes = new Map();
  async function visit(directory) {
    for (const entry of await fs.readdir(directory, {withFileTypes:true})) {
      if (['.git','.design-tools','artifacts','node_modules'].includes(entry.name)) continue;
      const file = path.join(directory,entry.name);
      if (entry.isDirectory()) await visit(file);
      else hashes.set(path.relative(root,file),createHash('sha256').update(await fs.readFile(file)).digest('hex'));
    }
  }
  await visit(root);
  return hashes;
}

test('real builds validate root and project hosting without changing existing files', async () => {
  const before = await hashExistingFiles();
  for (const url of ['https://owner.github.io/cafe', 'https://cafe.example']) {
    const artifact = await buildPages(url);
    const homepage = await fs.readFile(path.join(artifact,'index.html'),'utf8');
    assert(homepage.includes(`rel="canonical" href="${url}/"`));
    assert(homepage.includes('<title>Bahattar Cafe in Itahari | Coffee, Food &amp; a Little Pause</title>'));
    assert(homepage.includes(url.endsWith('/cafe')?'src="/cafe/assets/terrace-night.webp"':'src="/assets/terrace-night.webp"'));
    const menu = await fs.readFile(path.join(artifact,'menu/index.html'),'utf8');
    assert.equal([...menu.matchAll(/class="menu-item"/g)].length,66);
  }
  assert.deepEqual(await hashExistingFiles(),before,'Existing project files must remain byte-for-byte unchanged');
});
