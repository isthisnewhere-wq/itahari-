import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:4173';
const pages=JSON.parse(await fs.readFile('dist/pages.json','utf8'));
let passed=0;
for(const page of pages.filter(p=>p.route!=='/404/')){
 const response=await fetch(base+page.route);
 assert.equal(response.status,200,page.route);
 assert(response.headers.get('content-type').startsWith('text/html'),page.route);
 assert((await response.text()).includes('<h1'),page.route);passed++;
}
for(const file of ['/sitemap.xml','/robots.txt','/assets/styles.css','/assets/client.js','/assets/favicon.svg','/assets/interior.webp','/assets/coffee.webp','/assets/exterior.webp','/assets/terrace-night.webp','/assets/garden-lounge.webp','/assets/food.webp']){
 const response=await fetch(base+file);assert.equal(response.status,200,file);passed++;
}
const missing=await fetch(base+'/this-page-does-not-exist/');assert.equal(missing.status,404);assert((await missing.text()).includes('Lost your'));
console.log(`PASS: ${passed} live page/resource requests, proper HTML responses, and custom HTTP 404.`);
