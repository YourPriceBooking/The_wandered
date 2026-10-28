const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { JSDOM } = require('jsdom');
const load = require('./helpers/load-ts.cjs');
const render = load('src/components/Post/helpers/renderArticleHtml.ts').renderArticleHtml;
const copy = load('src/defaultData/editorialCopy.ts').editorialCopy;
const styles = new Proxy({}, {get: (_, key) => key === '__esModule' ? false : String(key)});
function component(file, imports = {}, globals = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(source, {exports, URL, ...globals, require: id => {
    if (id.endsWith('.scss')) return styles;
    if (id.endsWith('.css')) return {};
    if (id in imports) return imports[id];
    return require(id);
  }});
  return exports.default;
}
const Hero = component('src/components/Post/HeroImage/HeroImage.tsx', {
  'next/image': {__esModule:true,default:({priority,...props})=>React.createElement('img',props)},
  '@/defaultData/editorialCopy': {editorialCopy:copy},
});
const Post = component('src/components/Post/PostBlock.tsx', {
  '@/utils/structuredData':load('src/utils/structuredData.ts'),
  '@/defaultData/editorialCopy':{editorialCopy:copy},
  '@/utils/seoMetadata':load('src/utils/seoMetadata.ts'),
  '../../../public/HouseIcon':()=>null,
  '@/services/getReadableDate':load('src/services/getReadableDate.ts'),
  '../PageViewes':()=>React.createElement('p',null,'54'),
  '@/utils/normalizeImageUrl':load('src/utils/normalizeImageUrl.ts'),
  './HeroImage/HeroImage':Hero,
  './PostAuthor':({name})=>React.createElement('div',{'data-author':true},name),
  './ArticleImageViewer':({children})=>React.createElement('div',null,children),
  './helpers/renderArticleHtml':{renderArticleHtml:render},
  './helpers/readingMinutes':load('src/components/Post/helpers/readingMinutes.ts'),
});
const record = {heading:'Border crossing queues: a long article title',description:'DO NOT DISPLAY THIS SUMMARY',author:'Viacheslav Nikitenko',publicationDate:'2025-10-11T07:00:00Z',changeDate:'2025-10-11T09:00:00Z',imageUrl:[{url:'/hero.jpg',context:{alt:'Border crossing',caption:'Photo credit'}}],markup:'<p id="intro">An original introduction.</p><h3 id="country">Poland</h3><p>Useful information.</p>'};
for (const [country,language] of [['home','en'],['ukraine','uk'],['poland','pl']]) {
  test(`editorial header precedes image, omits summary and redundant update, keeps body: ${language}`,()=>{
    const dom=new JSDOM(renderToStaticMarkup(React.createElement(Post,{data:record,country,postPageLink:'story'})));
    const d=dom.window.document;
    assert.equal(d.querySelectorAll('h1').length,1);
    assert.equal(d.querySelector('h1').textContent,record.heading);
    assert.ok(d.querySelector('h1').compareDocumentPosition(d.querySelector('figure')) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.equal(d.querySelector('.updated'),null);
    assert.ok(!d.body.textContent.includes(record.description));
    assert.ok(d.body.textContent.includes(copy[language].reading));
    assert.equal(d.querySelector('#intro').textContent,'An original introduction.');
    assert.equal(d.querySelector('#country').tagName,'H2');
    assert.equal(d.querySelector('button[data-article-image]').getAttribute('aria-label'),copy[language].zoom);
    assert.equal(d.querySelector('figure figcaption').textContent,'Photo credit');
    assert.equal(d.querySelector('.overlay'),null);
    assert.ok(!d.body.textContent.includes('Table of contents'));
    dom.window.close();
  });
}
test('different valid update date is shown, and absent photo caption leaves no empty caption',()=>{
  const dom=new JSDOM(renderToStaticMarkup(React.createElement(Post,{data:{...record,changeDate:'2025-10-12T07:00:00Z',imageUrl:['/hero.jpg']},country:'home',postPageLink:'story'})));
  assert.ok(dom.window.document.querySelector('.updated time'));
  assert.equal(dom.window.document.querySelector('figcaption'),null);
  dom.window.close();
});
test('spacing normalization preserves real text, heading hierarchy, image links and safe zoom controls',()=>{
  const html=render('<p>Keep this<br>line break.</p><p><br></p><p><br></p><h3 id="main">Section</h3><h4>Subsection</h4><p><img src="/photo.jpg" alt="Photo"></p><a href="/original"><img src="/linked.jpg"></a>',[],'uk');
  const dom=new JSDOM(html),d=dom.window.document;
  assert.equal(d.querySelector('p').innerHTML,'Keep this<br>line break.');
  assert.equal(d.querySelector('#main').tagName,'H2');
  assert.equal(d.querySelector('h3').textContent,'Subsection');
  assert.equal(d.querySelector('#main').previousElementSibling.textContent,'Keep thisline break.');
  assert.equal(d.querySelector('button').getAttribute('aria-label'),copy.uk.zoom);
  assert.equal(d.querySelector('a button'),null);
  assert.equal(d.querySelector('a img').getAttribute('src'),'/linked.jpg');
  dom.window.close();
});
test('reading estimate is based on words, not markup or formatting',()=>{
  const {readingMinutes}=load('src/components/Post/helpers/readingMinutes.ts');
  assert.equal(readingMinutes('<p>'+Array(221).fill('word').join(' ')+'</p>'),2);
  assert.equal(readingMinutes('<p>&nbsp;</p>'),1);
});
test('image viewer opens original image, closes with Escape/backdrop and restores focus and scrolling',()=>{
  const dom=new JSDOM('<div id="root"></div>',{url:'https://www.thewandered.com'});
  const old={window:global.window,document:global.document,act:global.IS_REACT_ACT_ENVIRONMENT,navigator:Object.getOwnPropertyDescriptor(global,'navigator')};
  global.window=dom.window; global.document=dom.window.document; global.IS_REACT_ACT_ENVIRONMENT=true;
  Object.defineProperty(global,'navigator',{configurable:true,value:dom.window.navigator});
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');this.querySelector('button')?.focus();};
  dom.window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
  const Viewer=component('src/components/Post/ArticleImageViewer.tsx',{'@/defaultData/editorialCopy':{editorialCopy:copy}}, {document,window:dom.window,Element:dom.window.Element});
  const {createRoot}=require('react-dom/client'); const root=createRoot(document.querySelector('#root'));
  try {
    React.act(()=>root.render(React.createElement(Viewer,{language:'pl'},React.createElement('figure',null,React.createElement('button',{'data-article-image':'/original.jpg',id:'open'},React.createElement('img',{alt:'Full photo'})),React.createElement('figcaption',null,'Credit')))));
    const button=document.querySelector('#open'); button.focus();
    document.body.style.overflow='auto'; React.act(()=>button.click());
    let dialog=document.querySelector('dialog');
    assert.ok(dialog.open); assert.equal(dialog.getAttribute('aria-label'),copy.pl.imageViewer);
    assert.equal(dialog.querySelector('img').src,'https://www.thewandered.com/original.jpg');
    assert.equal(dialog.querySelector('figcaption').textContent,'Credit');
    assert.equal(document.body.style.overflow,'hidden');
    React.act(()=>dialog.dispatchEvent(new dom.window.Event('cancel',{cancelable:true})));
    assert.equal(dialog.open,false); assert.equal(document.activeElement,button); assert.equal(document.body.style.overflow,'auto');
    React.act(()=>button.click()); React.act(()=>dialog.click()); assert.equal(dialog.open,false);
    for(const src of ['javascript:alert(1)','https://[']) { button.dataset.articleImage=src; React.act(()=>button.click()); assert.equal(dialog.open,false); }
  } finally {
    React.act(()=>root.unmount()); dom.window.close(); global.window=old.window; global.document=old.document; global.IS_REACT_ACT_ENVIRONMENT=old.act;
    if(old.navigator) Object.defineProperty(global,'navigator',old.navigator); else delete global.navigator;
  }
});

test('author avatar handles an image that failed before hydration and upgrades Cloudinary to HTTPS',async()=>{
  const dom=new JSDOM('<div id="root"></div>',{url:'https://www.thewandered.com'});
  const old={window:global.window,document:global.document,act:global.IS_REACT_ACT_ENVIRONMENT,navigator:Object.getOwnPropertyDescriptor(global,'navigator')};
  global.window=dom.window;global.document=dom.window.document;global.IS_REACT_ACT_ENVIRONMENT=true;
  Object.defineProperty(global,'navigator',{configurable:true,value:dom.window.navigator});
  const Author=component('src/components/Post/PostAuthor.tsx',{
    '@/defaultData/authorsCopy':{authorsCopy:{en:{editorBio:'Editor'}}},
    '@/lib/hooks':{useAppSelector:selector=>selector({allAuthors:{allAuthorsData:[]}})},
    '@/utils/authorIdentity':{authorProfile:()=>({url:'/authors#viacheslav'})},
    '@/defaultData/authorProfiles':{fallbackAuthors:[{name:'Viacheslav Nikitenko',image:'http://res.cloudinary.com/author.png',links:[]}],authorSocialLinks:()=>[]},
    'next/link':({children,...props})=>React.createElement('a',props,children),
  },{document});
  const element=React.createElement(Author,{name:'Viacheslav Nikitenko',country:'home'});
  const html=renderToStaticMarkup(element);
  assert.ok(html.includes('https://res.cloudinary.com/author.png'));
  document.querySelector('#root').innerHTML=html;
  const image=document.querySelector('.authorAvatar');
  Object.defineProperty(image,'complete',{value:true});
  const {hydrateRoot}=require('react-dom/client');let root;
  try {
    await React.act(async()=>{root=hydrateRoot(document.querySelector('#root'),element);});
    assert.equal(document.querySelector('.authorAvatar'),null);
    assert.equal(document.querySelector('.authorInitial').textContent,'V');
    assert.equal(document.querySelector('a').textContent,'Viacheslav Nikitenko');
  } finally {
    React.act(()=>root?.unmount());dom.window.close();global.window=old.window;global.document=old.document;global.IS_REACT_ACT_ENVIRONMENT=old.act;
    if(old.navigator)Object.defineProperty(global,'navigator',old.navigator);else delete global.navigator;
  }
});
