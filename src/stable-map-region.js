function $(s){return document.querySelector(s)}
const REGIONS=[
  {id:'forest',name:'숲',mark:'🌲',map:'map_park.png',color:'#55b969'},
  {id:'field',name:'초원',mark:'🌾',map:'map_field.png',color:'#78c96f'},
  {id:'river',name:'강가',mark:'🌊',map:'map_river.png',color:'#63bad8'},
  {id:'city',name:'도시',mark:'🏙️',map:'map_city.png',color:'#8d9ba8'}
];
const MAP_BASE='./assets/';
const TILE=900;
let lastRegion=null;
let lastToast='';
function player(){return window.CATCHABUGS_GAME?.getPlayer?.()||{x:0,y:0}}
function stableRegion(x,y){const tx=Math.floor((Number(x||0)+100000)/TILE);const ty=Math.floor((Number(y||0)+100000)/TILE);const v=Math.abs((tx*31+ty*17)%12);if(v<=4)return REGIONS[0];if(v<=7)return REGIONS[1];if(v<=9)return REGIONS[2];return REGIONS[3]}
function stripMapRotate(){const map=$('#map');if(!map)return;const style=map.style.transform||'';const translate=(style.match(/translate\([^)]*\)/)||['translate(0px,0px)'])[0];map.style.setProperty('transform',`${translate} scale(1.16)`,'important')}
function applyStableRegion(){const map=$('#map');if(!map)return;const p=player();const r=stableRegion(p.x,p.y);map.style.setProperty('background',`${r.color} url('${MAP_BASE}${r.map}') center/260px repeat`,'important');document.body.dataset.stableRegion=r.id;document.body.dataset.stableRegionName=r.name;if(lastRegion!==r.id){lastRegion=r.id;const badge=$('#stableRegionBadge')||document.createElement('div');badge.id='stableRegionBadge';badge.textContent=`${r.mark} ${r.name} 구역`;if(!badge.parentNode)$('#game')?.appendChild(badge)}}
function calmRegionToast(){const toast=$('#toast');if(!toast||toast.style.display==='none')return;const t=toast.textContent||'';if(t.includes('지역 진입')){if(t===lastToast){toast.style.display='none';return}lastToast=t;setTimeout(()=>{if((toast.textContent||'').includes('지역 진입'))toast.style.display='none'},500)}}
function injectStyle(){if($('#stableMapRegionStyle'))return;const style=document.createElement('style');style.id='stableMapRegionStyle';style.textContent=`#stableRegionBadge{position:absolute;left:10px;top:150px;z-index:74;border-radius:999px;background:#07111ed8;color:white;border:1px solid #ffffff44;padding:6px 9px;font-size:10px;font-weight:1000;box-shadow:0 8px 18px #0006;pointer-events:none}#map{transform-origin:50% 54%!important;transition:filter .28s ease!important}body[data-stable-region="forest"] #stableRegionBadge{background:#1f6f42e8}body[data-stable-region="field"] #stableRegionBadge{background:#547b22e8}body[data-stable-region="river"] #stableRegionBadge{background:#176984e8}body[data-stable-region="city"] #stableRegionBadge{background:#39414ee8}`;document.head.appendChild(style)}
function tick(){injectStyle();stripMapRotate();applyStableRegion();calmRegionToast();requestAnimationFrame(tick)}
document.addEventListener('DOMContentLoaded',()=>setTimeout(tick,900));setTimeout(tick,1500);
