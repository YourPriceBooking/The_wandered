const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./helpers/load-ts.cjs');
const helpers = load('src/utils/pageviewTotals.ts');
const origin = 'https://www.thewandered.com';
const articles = [origin+'/canada/story', origin+'/canada/other', origin+'/ukraine/story', origin+'/home-story'];

test('Canada is landing plus all articles; homepage is its own collection, not all sections', () => {
  const result = helpers.aggregatePageviews([
    {url:'/canada',pageviews:275}, {url:'/canada/story',pageviews:312}, {url:'/canada/other',pageviews:165},
    {url:'/',pageviews:7481}, {url:'/home-story',pageviews:10}, {url:'/ukraine/story',pageviews:20},
    {url:'/canada/authors',pageviews:999}, {url:'/travel-resources',pageviews:1000},
  ], articles);
  assert.equal(result.sectionTotals.canada, 752);
  assert.equal(result.sectionTotals.home, 7491);
  assert.equal(result.sectionTotals.ukraine, 20);
  assert.equal(result.pageviewsData.find(row => row.url === '/canada/story').pageviews, 312);
});

test('empty sections are queried and can have landing views without any articles', () => {
  const paths = helpers.analyticsQueryPaths([]);
  for (const country of ['ukraine','poland','usa','canada','australia','singapore','uncharted-planet']) {
    assert.ok(paths.includes('/'+country)); assert.ok(paths.includes('/'+country+'/'));
  }
  assert.ok(paths.includes('/'));
  assert.equal(new Set(paths).size, paths.length);
  const result = helpers.aggregatePageviews([{url:'/australia/',pageviews:42},{url:'/singapore',pageviews:12}],[]);
  assert.equal(result.sectionTotals.australia, 42);
  assert.equal(result.sectionTotals.singapore, 12);
});

test('slash and encoded variants merge once per article; duplicate inventory cannot double totals', () => {
  const url = origin+'/ukraine/trip-%D0%BC%D1%96%D1%81%D1%82%D0%BE-%26-spa';
  const encoded = new URL(url).pathname, decoded = decodeURIComponent(encoded);
  const query = helpers.analyticsQueryPaths([url,url]);
  for (const path of [encoded,decoded,encodeURI(decoded)]) {
    assert.ok(query.includes(path)); assert.ok(query.includes(path+'/'));
  }
  assert.equal(new Set(query).size, query.length);
  const result = helpers.aggregatePageviews([
    {url:encoded,pageviews:2},{url:decoded+'/',pageviews:3},{url:'/ukraine/',pageviews:4},
  ],[url,url]);
  assert.equal(result.sectionTotals.ukraine, 9);
  assert.equal(result.pageviewsData.find(row=>row.url===decoded).pageviews, 5);
  assert.equal(helpers.normalizeAnalyticsPath('/canada/100%-travel'), '/canada/100%-travel');
});

test('invalid counts cannot publish a misleading total', () => {
  for (const count of [-1,NaN,Infinity,1.5]) assert.throws(()=>helpers.aggregatePageviews([{url:'/canada',pageviews:count}],articles));
});

function endpoint(runReport, urls = articles) {
  return load('src/app/api/gadata/route.ts', { require: id => {
    if (id === 'dotenv') return { config() {} };
    if (id === 'googleapis') return { google: { auth: {JWT: class {async authorize() {}}}, analyticsdata: () => ({properties:{runReport}}) } };
    if (id === 'next/server') return {NextResponse:{json:Response.json}};
    if (id === '@/services/getSitemapEntries') return {getSitemapSnapshot:async()=>({data:{entries:urls.map(url=>({url}))}})};
    if (id === '@/utils/pageviewTotals') return helpers;
    throw Error(id);
  }, console:{error(){}} }).GET;
}

test('API uses complete inventory, queries empty roots, and returns totals plus individual counts', async () => {
  const GET = endpoint(async request => {
    assert.equal(request.property,'properties/453172943');
    const body=request.requestBody;
    assert.equal(body.dateRanges[0].startDate,'2024-08-01');
    assert.equal(body.metrics[0].name,'screenPageViews');
    assert.ok(body.dimensionFilter.filter.inListFilter.values.includes('/singapore/'));
    assert.equal(body.dimensionFilter.filter.inListFilter.caseSensitive,true);
    return {data:{rowCount:2,rows:[
      {dimensionValues:[{value:'/canada'}],metricValues:[{value:'275'}]},
      {dimensionValues:[{value:'/canada/story'}],metricValues:[{value:'312'}]},
    ]}};
  });
  const response=await GET(); const data=await response.json();
  assert.equal(response.status,200); assert.equal(data.sectionTotals.canada,587);
  assert.equal(data.pageviewsData.find(row=>row.url==='/canada/story').pageviews,312);
});

test('API batches large complete inventories and refuses truncated reports', async () => {
  const urls=Array.from({length:600},(_,i)=>origin+'/canada/story-'+i);
  let calls=0;
  const GET=endpoint(async ({requestBody})=>{
    calls++; assert.ok(requestBody.dimensionFilter.filter.inListFilter.values.length<=1000);
    return {data:{rowCount:0,rows:[]}};
  }, urls);
  const data=await (await GET()).json(); assert.ok(calls>1); assert.equal(data.sectionTotals.canada,0);
  const broken=endpoint(async()=>({data:{rowCount:2,rows:[]}}));
  const failed=await (await broken()).json(); assert.equal(failed.error,'Incomplete analytics report');
  assert.equal(failed.sectionTotals,undefined);
});

test('Redux stores section totals separately and keeps individual article counts', () => {
  const slice=load('src/lib/features/gadataSlice.ts');
  const state=slice.default(undefined, slice.fetchPageviews.fulfilled({pageviewsData:[{url:'/canada/story',pageviews:312}],sectionTotals:{canada:752}},'request',undefined));
  assert.equal(state.pageviews['/canada/story'],312); assert.equal(state.sectionTotals.canada,752);
  const failed=slice.default(state,slice.fetchPageviews.fulfilled({pageviewsData:[],error:'GA unavailable'},'request',undefined));
  assert.equal(failed.sectionTotals.canada,752); assert.equal(failed.pageviews['/canada/story'],312);
});

test('section UI reads totals, keeps article counts separate and localizes its hint', () => {
  const fs=require('node:fs'), vm=require('node:vm'), ts=require('typescript');
  const React=require('react'), {renderToStaticMarkup}=require('react-dom/server');
  const {JSDOM}=require('jsdom');
  const exports={};
  const source=ts.transpileModule(fs.readFileSync('src/components/ViewCounter/ViewCounter.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInNewContext(source,{exports,require:id=>{
    if (id==='react/jsx-runtime') return require(id);
    if (id.endsWith('.scss')) return {};
    if (id==='@/lib/hooks') return {useAppSelector:selector=>selector({gaData:{pageviews:{'/canada':275},sectionTotals:{canada:752,ukraine:1663,poland:639,home:9653}}})};
    throw Error(id);
  }});
  for (const [country,lang,count,hint] of [
    ['canada','en',752,'Views of this section and its articles'],
    ['ukraine','uk',1663,'Перегляди розділу та його статей'],
    ['poland','pl',639,'Wyświetlenia sekcji i jej artykułów'],
    ['home','en',9653,'Views of the homepage and its articles'],
  ]) {
    const dom=new JSDOM(renderToStaticMarkup(React.createElement(exports.default,{country,viewPath:country==='home'?'/':'/'+country})));
    const counter=dom.window.document.body.firstElementChild;
    assert.equal(counter.lang,lang); assert.equal(counter.title,hint);
    assert.equal(counter.querySelector('p').textContent,String(count));
    dom.window.close();
  }
});
