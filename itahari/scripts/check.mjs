import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {categories,itemCount} from '../src/menu.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const pages=JSON.parse(await fs.readFile(path.join(dist,'pages.json'),'utf8'));
const htmlByRoute=new Map(await Promise.all(pages.map(async p=>[p.route,await fs.readFile(path.join(root,p.file),'utf8')])));
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
const plain=s=>decode(s.replace(/<[^>]*>/g,'')).trim();
const titles=new Set(),descriptions=new Set(),headings=new Set();
let links=0,anchors=0,images=0,schemas=0;
const edges=[];
const incoming=new Set(['/']);
for(const p of pages){
  const html=htmlByRoute.get(p.route);
  assert.equal([...html.matchAll(/<h1(?:\s[^>]*)?>/g)].length,1,`${p.route}: one H1`);
  const h1=plain(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]);
  assert(!headings.has(h1),`Duplicate heading ${h1}`);headings.add(h1);
  assert(!titles.has(p.title),`Duplicate title ${p.title}`);titles.add(p.title);
  assert(!descriptions.has(p.description),`Duplicate description ${p.route}`);descriptions.add(p.description);
  assert(html.includes('rel="canonical"'),`${p.route}: canonical`);
  assert(html.includes('name="twitter:card"'),`${p.route}: social metadata`);
  assert(html.includes('href="#main"'),`${p.route}: skip link`);
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`${p.route}: unique element IDs`);
  for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){JSON.parse(match[1]);schemas++;}
  for(const match of html.matchAll(/<(a|link|script|img)\b[^>]*\b(?:href|src)="([^"]+)"[^>]*>/g)){
    const tag=match[1],url=decode(match[2]);
    if(!url.startsWith('/')&&!url.startsWith('#'))continue;
    const [target,hash]=url.split('#');const route=target||p.route;
    if(route.includes('.')&&!route.endsWith('/')){await fs.access(path.join(dist,route));continue;}
    assert(htmlByRoute.has(route),`${p.route}: missing target ${route}`);
    if(hash){assert(htmlByRoute.get(route).includes(`id="${hash}"`),`${p.route}: missing anchor ${url}`);anchors++;}
    if(tag==='a'){
      links++;incoming.add(route);
      const anchorMatch=html.slice(match.index).match(/^<a\b[^>]*>([\s\S]*?)<\/a>/);
      const text=plain(anchorMatch?.[1]||'');
      if(route!==p.route&&target){const position=match.index<html.indexOf('<main')?'Header navigation':match.index>html.indexOf('<footer')?'Footer navigation':'Main content / related reading';edges.push([p.route,url,text||'Bahattar Cafe home',position]);}
    }
  }
  for(const match of html.matchAll(/<img\b[^>]*>/g)){
    assert(match[0].includes('alt='),`${p.route}: image alt`);
    assert(match[0].includes('width=')&&match[0].includes('height='),`${p.route}: reserved image space`);images++;
  }
  assert(html.includes('href="tel:+9779820347351"'),`${p.route}: phone action`);
}
for(const p of pages.filter(p=>p.route!=='/404/'))assert(incoming.has(p.route),`Orphan page: ${p.route}`);
assert.equal(itemCount,66);assert.equal(categories.length,15);
const menuHtml=htmlByRoute.get('/menu/');
const rendered=[...menuHtml.matchAll(/<article class="menu-item" data-price="(\d+)"><div><h4>([^<]+)<\/h4>/g)].map(m=>({name:decode(m[2]),price:Number(m[1])}));
assert.equal(rendered.length,66);
let supplied;
if(process.argv[2]){
  const source=await fs.readFile(process.argv[2],'utf8');
  const section=source.split('# 2. COMPLETE MENU AND PRICING')[1].split('# 3. FIVE CORE MONEY PAGES')[0];
  supplied=[...section.matchAll(/^\|\s*([^|]+?)\s*\|\s*Rs\.\s*(\d+)\s*\|/gm)].map(m=>({name:m[1].trim(),price:Number(m[2])}));
  assert.equal(supplied.length,66,'66 independently parsed source prices');
  await fs.writeFile(path.join(root,'docs/supplied-menu-reference.json'),JSON.stringify(supplied,null,2));
}else supplied=JSON.parse(await fs.readFile(path.join(root,'docs/supplied-menu-reference.json'),'utf8'));
assert.deepEqual(rendered,supplied,'Every rendered name and price matches the original brief');
const xml=await fs.readFile(path.join(dist,'sitemap.xml'),'utf8');
assert.equal([...xml.matchAll(/<loc>/g)].length,pages.length-1);
const robots=await fs.readFile(path.join(dist,'robots.txt'),'utf8');assert(robots.includes('Sitemap:'));
const uniqueEdges=[...new Map(edges.map(e=>[e.join('|'),e])).values()];
await fs.writeFile(path.join(root,'docs/internal-linking-map.md'),'# Internal linking map\n\nGenerated from the actual built HTML. Every listed target and anchor passed the static link check. No published content page is orphaned. Global footer links connect all core pages. Category links deep-link into the complete menu; supporting articles connect to the appropriate category and core page, followed by contact or visit actions.\n\n| Source URL | Target URL | Anchor text | Linking rationale | Placement | QA status | Owner confirmation |\n|---|---|---|---|---|---|---|\n'+uniqueEdges.map(([from,to,text,placement])=>`| ${from} | ${to} | ${text.replaceAll('|','/')} | ${to.includes('#')?'Inspect the relevant menu category':to==='/contact/'||to==='/location/'?'Plan a visit or ask the café':placement==='Footer navigation'?'Connect visitor information and core pages':'Continue into the relevant topic'} | ${placement} | PASS | ${to==='/hours/'?'Confirm supplied hours':to==='/location/'?'Confirm street address and Maps pin':'None for link function'} |`).join('\n')+'\n');
console.log(`PASS: ${pages.length} pages, unique H1s/titles/descriptions, ${links} internal links, ${anchors} anchors, ${images} image elements, ${schemas} JSON-LD blocks. All 66 item names/prices match the original brief. Sitemap and robots verified. No orphan content pages.`);
