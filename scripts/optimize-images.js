const { chromium } = require('playwright'); const fs=require('fs');
// Regenerates the optimized dist/assets variants from source-assets/ using Chromium's canvas encoder.
// Usage:  python3 -m http.server 8766 --bind 127.0.0.1 --directory source-assets &
//         NODE_PATH=$(npm root -g) node scripts/optimize-images.js
const BASE='http://127.0.0.1:8766'; const OUT=require('path').join(__dirname,'../dist/assets');
// [src, basename, widths, formats]
const jobs=[
 ['/exciting-tiger.png','exciting-tiger',[1536,900],['webp','jpeg']],
 ['/exciting-meteor.png','exciting-meteor',[1536,900],['webp','jpeg']],
 ['/exciting-bicycle.png','exciting-bicycle',[1536,900],['webp','jpeg']],
 ['/conventional.png','conventional',[560],['webp','jpeg']],
 ['/fha.png','fha',[560],['webp','jpeg']],
 ['/va.png','va',[560],['webp','jpeg']],
 ['/yawning-original.jpg','yawning',[1800,1000],['webp','jpeg']],
 ['/original-1.png','erik-byline',[160],['webp','png']],
];
(async()=>{
 const b=await chromium.launch(); const p=await (await b.newContext()).newPage();
 await p.goto(BASE+'/');
 for(const [src,name,widths,fmts] of jobs){
  for(const w of widths){ for(const f of fmts){
   const q= f==='webp'?0.80: f==='jpeg'?0.82: undefined;
   const data=await p.evaluate(async({src,w,f,q})=>{
     const img=new Image(); img.src=src; await img.decode();
     const h=Math.round(img.naturalHeight*w/img.naturalWidth);
     const c=document.createElement('canvas'); c.width=w; c.height=h;
     const ctx=c.getContext('2d'); ctx.imageSmoothingQuality='high';
     // multi-step downscale for quality when shrinking a lot
     let cur=img, cw=img.naturalWidth, ch=img.naturalHeight;
     while(cw/2>w){ const t=document.createElement('canvas'); t.width=Math.round(cw/2); t.height=Math.round(ch/2); const tc=t.getContext('2d'); tc.imageSmoothingQuality='high'; tc.drawImage(cur,0,0,t.width,t.height); cur=t; cw=t.width; ch=t.height; }
     ctx.drawImage(cur,0,0,w,h);
     return {h, url:c.toDataURL('image/'+f,q)};
   },{src,w,f,q});
   const ext=f==='jpeg'?'jpg':f; const file=`${OUT}/${name}-${w}.${ext}`;
   fs.writeFileSync(file,Buffer.from(data.url.split(',')[1],'base64'));
   console.log(file.replace(OUT+'/',''), `${w}x${data.h}`, Math.round(fs.statSync(file).size/1024)+'KB');
  }}
 }
 await b.close();
})();
