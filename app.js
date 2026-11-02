(async()=>{
const $=s=>document.querySelector(s);
const [cfg,data]=await Promise.all(['data/config.json','data/villagers.json'].map(u=>fetch(u,{cache:'no-cache'}).then(r=>r.json())));
const V=data.villagers, norm=s=>s.trim().toLowerCase().replace(/^@/,'');
let pref=localStorage.getItem('lc_pref')||'auto';localStorage.removeItem('lc_mode');
let loc=JSON.parse(localStorage.getItem('lc_geo')||'null')||LCSun.tzGuess();
const now=()=>window.__lcNow?new Date(window.__lcNow):new Date();
const sunAlt=()=>LCSun.alt(now(),loc.lat,loc.lon);
const autoMode=()=>sunAlt()>-0.833?'day':'night';
let mode=pref==='auto'?autoMode():pref;
// donate
if(cfg.cashtag){const d=$('#donate');d.href='https://cash.app/$'+cfg.cashtag.replace(/^\$/,'');d.hidden=false;}
// streak
const today=new Date().toLocaleDateString('en-CA'), yest=new Date(Date.now()-864e5).toLocaleDateString('en-CA');
let st=JSON.parse(localStorage.getItem('lc_streak')||'{}');
if(st.last!==today){st.count=st.last===yest?(st.count||0)+1:1;st.best=Math.max(st.best||0,st.count);st.total=(st.total||0)+1;st.last=today;localStorage.setItem('lc_streak',JSON.stringify(st));}
const rewards=['🔥 You added a log to the campfire.','🦉 The owl hooted hello.','🏮 You lit a lantern on Main Street.','🎸 Someone played your song at the fire.','⭐ You spotted a shooting star.','🌲 You planted a pine tree.','🍂 You raked the leaves by your porch.'];
const badge=st.count>=30?'🏆 Village Legend':st.count>=7?'🌟 Regular':st.count>=3?'🏮 Neighbor':'🌱 Newcomer';
$('#streak').innerHTML=`Daily visit streak: <b>${st.count} day${st.count>1?'s':''}</b> · ${badge}<br><small>${rewards[(new Date().getDate()+st.count)%rewards.length]} Best: ${st.best} · Visits: ${st.total}. Come back tomorrow to keep it going!</small>`;
// map
const W=cfg.map.width,H=cfg.map.height,b=[[0,0],[H,W]];
const map=L.map('map',{crs:L.CRS.Simple,minZoom:-1,maxZoom:3,zoomSnap:.25,attributionControl:false});
let ov=L.imageOverlay(cfg.map[mode],b).addTo(map);map.fitBounds(b);map.setMaxBounds([[-H*.2,-W*.2],[H*1.2,W*1.2]]);
const markers={};
V.forEach(v=>{const m=L.marker([H-v.y,v.x],{icon:L.divIcon({className:'',html:`<span class="lbl${v.owner?' owner':''}">${v.flag} @${v.handle}${v.owner?' 🔥':''}</span>`,iconSize:null})}).addTo(map).on('click',()=>show(v));markers[norm(v.handle)]=m;});
function show(v){map.flyTo([H-v.y,v.x],2,{duration:1.2});$('#house').innerHTML=`<img src="${v.image}" alt="House of @${v.handle}"><h3>${v.flag} ${v.name}</h3><div>@${v.handle} · ${v.country}${v.owner?' · 🔥 Campfire house':''}</div><small>Moved in: ${new Date(v.joined+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</small><br><a href="https://www.tiktok.com/@${v.handle}" target="_blank" rel="noopener">Open TikTok →</a> · <a href="#" id="walkhere">🚶 Walk here</a>`;$('#walkhere').onclick=e=>{e.preventDefault();tab('walk');viewer.loadScene(v.pano);};}
$('#hl').innerHTML=V.map(v=>`<option value="@${v.handle}">`).join('');
$('#sf').onsubmit=e=>{e.preventDefault();const q=norm($('#q').value);const v=V.find(v=>norm(v.handle)===q)||V.find(v=>q&&(norm(v.handle).includes(q)||v.name.toLowerCase().includes(q)));
 if(!v){$('#msg').textContent='No house yet for that name — comment “Build my house 🏠” on TikTok!';return;}$('#msg').textContent='';tab('map');show(v);location.hash='@'+v.handle;};
// pano
function scenes(){const s={};data.panos.forEach(p=>s[p.id]={title:p.title,type:'equirectangular',panorama:p[mode],haov:360,vaov:160,hfov:100,autoLoad:true,hotSpots:p.links.map(l=>({pitch:-10,yaw:l.yaw,type:'scene',text:'➜ '+data.panos.find(x=>x.id===l.to).title,sceneId:l.to}))});return s;}
let viewer=pannellum.viewer('pano',{default:{firstScene:'p1',sceneFadeDuration:800,autoLoad:true,showFullscreenCtrl:true},scenes:scenes()});
// tabs
function tab(t){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));document.querySelectorAll('.tab').forEach(s=>s.classList.toggle('on',s.id==='t-'+t));if(t==='map')setTimeout(()=>map.invalidateSize(),50);if(t==='walk')setTimeout(()=>viewer.resize(),50);}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>tab(b.dataset.t));
// day/night: Auto (real local sunrise/sunset) / Day / Night
function applyDim(){const a=sunAlt();document.body.style.setProperty('--dim',pref==='auto'&&a>-6&&a<4?String(Math.min(.35,Math.abs(a-4)/10*.35)):'0');}
function setMode(m){if(m===mode&&document.body.classList.contains(m))return;mode=m;document.body.classList.remove('day','night');document.body.classList.add(m);document.querySelector('meta[name=theme-color]').content=m==='day'?'#8fc3ff':'#0b1020';ov.setUrl(cfg.map[m]);const cur=viewer.getScene();viewer.destroy();viewer=pannellum.viewer('pano',{default:{firstScene:cur,sceneFadeDuration:800,autoLoad:true},scenes:scenes()});}
function label(){$('#dn').textContent=pref==='auto'?(mode==='night'?'🌙A':'☀️A'):pref==='night'?'🌙':'☀️';$('#dn').title=pref==='auto'?'Auto (your sunrise/sunset) — tap for Day':pref==='day'?'Day — tap for Night':'Night — tap for Auto';}
function tick(){setMode(pref==='auto'?autoMode():pref);applyDim();label();}
$('#dn').onclick=()=>{pref={auto:'day',day:'night',night:'auto'}[pref];localStorage.setItem('lc_pref',pref);tick();};
document.body.classList.add(mode);tick();setInterval(tick,60000);window.__lcTick=tick;
if(!localStorage.getItem('lc_geo_asked')&&navigator.geolocation){localStorage.setItem('lc_geo_asked','1');navigator.geolocation.getCurrentPosition(p=>{loc={lat:+p.coords.latitude.toFixed(2),lon:+p.coords.longitude.toFixed(2),src:'gps'};localStorage.setItem('lc_geo',JSON.stringify(loc));tick();},()=>{},{timeout:10000,maximumAge:864e5});}
// news + top
$('#news').innerHTML=data.news.map(n=>`<div class="news"><time>${n.date}</time><div>${n.text}</div></div>`).join('');
$('#top').innerHTML=[...V].filter(v=>!v.owner).sort((a,b)=>b.likes-a.likes||a.joined.localeCompare(b.joined)).map(v=>`<li>${v.flag} <b>@${v.handle}</b> — ❤️ ${v.likes}</li>`).join('');
const h=decodeURIComponent(location.hash.slice(1));if(h){$('#q').value=h;$('#sf').requestSubmit();}
})();
