if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,o)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(s[r])return;let t={};const c=e=>i(e,r),f={module:{uri:r},exports:t,require:c};s[r]=Promise.all(n.map((e=>f[e]||c(e)))).then((e=>(o(...e),t)))}}define(["./workbox-f683aea5"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/config.json",revision:"72861b7c4d23a6689c17df97a831516b"},{url:"assets/logo.png",revision:"10627e9a123666382a7b209c5f1ec49a"},{url:"assets/v2.yaml",revision:"400f395ced9464efa5c1303e871b5280"},{url:"index.html",revision:"19a03bac9c81d4acf18f380c992a90b6"},{url:"main.js",revision:"fd461ecba6800765ef5ee3cf3a8f5059"},{url:"main.js.LICENSE.txt",revision:"5ec4cb93361f2441de3393b497821392"}],{})}));
