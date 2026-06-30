import { ASSET_BASE, BUGS, GRADES } from './data/bugs.js';

const $ = (s) => document.querySelector(s);
const REGIONS = [
  { id:'forest', name:'숲', mark:'🌲', map:'map_park.png', color:'#55b969' },
  { id:'field', name:'초원', mark:'🌾', map:'map_field.png', color:'#78c96f' },
  { id:'river', name:'강가', mark:'🌊', map:'map_river.png', color:'#63bad8' },
  { id:'city', name:'도시', mark:'🏙️', map:'map_city.png', color:'#8d9ba8' }
];

const game = {
  player:{ x:0, y:0 },
  points:0,
  entities:[],
  caught:{},
  activeCatch:null,
  catchStart:0,
  seq:0,
  regionId:'forest',
  input:{ dragging:false, lx:0, ly:0, vx:0, vy:0 },
  lastEvent:'오늘은 아직 특별한 일이 없었다. 호박사: “그런 날도 있는 거지.”'
};

function bugImage(bug){
  return `<img src="${ASSET_BASE}insects/${bug.file}" onerror="this.remove();this.parentNode.textContent='${bug.emoji}'">`;
}
function toast(msg){
  const n=$('#toast');
  n.textContent=msg;
  n.style.display='block';
  clearTimeout(toast.t);
  toast.t=setTimeout(()=>n.style.display='none',1300);
}
function regionById(id){ return REGIONS.find(r=>r.id===id) || REGIONS[0]; }
function currentRegion(){
  const x=game.player.x, y=game.player.y;
  const river=Math.abs(Math.sin((x+y)/620));
  const city=Math.sin((x-y)/780);
  const forest=Math.cos(x/540)+Math.sin(y/480);
  if(river>.9) return regionById('river');
  if(city>.62) return regionById('city');
  if(forest>.45) return regionById('forest');
  return regionById('field');
}
function applyRegion(r){
  if(game.regionId!==r.id){ game.regionId=r.id; toast(`${r.mark} ${r.name} 지역 진입`); }
  const map=$('#map');
  map.style.background=`${r.color} url('${ASSET_BASE}${r.map}') center/260px repeat`;
  const card=document.querySelector('.hud .card');
  if(card) card.textContent=`${r.mark} ${r.name}`;
}
function pickGrade(){
  const r=Math.random();
  if(r<.004) return GRADES[8];
  if(r<.018) return GRADES[7];
  if(r<.055) return GRADES[6];
  if(r<.13) return GRADES[5];
  if(r<.27) return GRADES[4];
  if(r<.45) return GRADES[3];
  if(r<.65) return GRADES[2];
  if(r<.83) return GRADES[1];
  return GRADES[0];
}
function pickBug(region){
  const pool=BUGS.filter(b=>Array.isArray(b.habitat)&&b.habitat.includes(region.id));
  const list=pool.length?pool:BUGS;
  return list[Math.floor(Math.random()*list.length)];
}
function spawnNearPlayer(){
  const region=currentRegion();
  const bug=pickBug(region);
  const grade=pickGrade();
  const a=Math.random()*Math.PI*2;
  const d=180+Math.random()*420;
  game.entities.push({
    id:`bug-${game.seq++}`,
    bug, grade,
    regionId:region.id,
    wx:game.player.x+Math.cos(a)*d,
    wy:game.player.y+Math.sin(a)*d,
    discovered:false,
    signal:grade.pts>=56||Math.random()<.25,
    drift:Math.random()*Math.PI*2,
    mood:Math.random()<.2?'shy':'calm'
  });
}
function startGame(){
  $('#title').style.display='none';
  $('#game').style.display='block';
  while(game.entities.length<8) spawnNearPlayer();
  toast('호박사: 레이더 신호를 따라가 보자.');
}
function pos(e){ return { x:e.wx-game.player.x, y:e.wy-game.player.y }; }
function updateAI(e){
  e.drift+=.012;
  const p=pos(e), d=Math.hypot(p.x,p.y), s=e.grade.speed;
  if(e.bug.behavior==='flutter'){
    e.wx+=Math.sin(e.drift*1.8)*.18*s; e.wy+=Math.cos(e.drift*1.1)*.14*s;
  }else if(e.bug.behavior==='jump'){
    if(Math.random()<.012){ e.wx+=(Math.random()*2-1)*14; e.wy+=(Math.random()*2-1)*14; }
  }else if(e.bug.behavior==='dart'){
    e.wx+=Math.sin(e.drift*2.7)*.25*s; e.wy+=Math.cos(e.drift*2.1)*.2*s;
  }else{
    e.wx+=Math.sin(e.drift)*.06*s; e.wy+=Math.cos(e.drift*.7)*.05*s;
  }
  if(d<80&&e.mood==='shy'&&Math.random()<.012){
    const away=Math.atan2(p.y,p.x);
    e.wx+=Math.cos(away)*40; e.wy+=Math.sin(away)*40; e.signal=true;
    toast('깜짝! 생태 신호가 이동했다.');
  }
}
function bars(d){
  if(d<90) return '●●●●';
  if(d<170) return '●●●○';
  if(d<310) return '●●○○';
  if(d<480) return '●○○○';
  return '○○○○';
}
function dir(dx,dy){
  const ax=Math.abs(dx), ay=Math.abs(dy);
  if(ax<40&&ay<40) return '바로 근처';
  if(ax>ay*1.4) return dx>0?'오른쪽':'왼쪽';
  if(ay>ax*1.4) return dy>0?'아래쪽':'위쪽';
  if(dx>0&&dy>0) return '오른쪽 아래';
  if(dx>0&&dy<0) return '오른쪽 위';
  if(dx<0&&dy>0) return '왼쪽 아래';
  return '왼쪽 위';
}
function radarItems(){
  return game.entities.map(e=>{
    const dx=e.wx-game.player.x, dy=e.wy-game.player.y;
    return { e, dx, dy, d:Math.hypot(dx,dy) };
  }).sort((a,b)=>a.d-b.d);
}
function renderRadar(){
  const screen=$('#radarScreen');
  if(!screen) return;
  const range=620, radius=48;
  const items=radarItems().filter(i=>i.d<=range);
  const near=items[0];
  if(near && !near.e.discovered && near.d<95){
    near.e.discovered=true;
    const r=regionById(near.e.regionId);
    toast(`${r.mark} ${near.e.grade.name} ${near.e.bug.name} 발견!`);
  }
  screen.querySelectorAll('.radar-blip').forEach(n=>n.remove());
  items.slice(0,14).forEach(i=>{
    const n=document.createElement('div');
    n.className=`radar-blip${(i.e.signal||i.d<95)?' signal':''}${i.e.discovered?'':' hidden'}`;
    n.style.setProperty('--c',i.e.grade.color);
    n.style.left=`${50+(i.dx/range)*radius}%`;
    n.style.top=`${50+(i.dy/range)*radius}%`;
    n.title=i.e.discovered?`${i.e.grade.name} ${i.e.bug.name}`:'미확인 생태 신호';
    screen.appendChild(n);
  });
  $('#radarCount').textContent=items.length;
  if(near){
    const r=regionById(near.e.regionId);
    const step=Math.max(1,Math.round(near.d/45));
    const label=near.e.discovered?near.e.bug.name:'미확인 신호';
    $('#radarHint').textContent=`${bars(near.d)} · ${dir(near.dx,near.dy)} ${step}걸음 · ${r.mark} ${label}`;
  }else{
    $('#radarHint').textContent='○○○○ · 주변 신호 없음';
  }
}
function renderWorld(){
  const r=currentRegion();
  applyRegion(r);
  $('#map').style.transform=`translate(${-game.player.x%260}px,${-game.player.y%260}px) scale(1.2)`;
  $('#pt').textContent=game.points;
  game.entities=game.entities.filter(e=>Math.hypot(e.wx-game.player.x,e.wy-game.player.y)<900);
  while(game.entities.length<8) spawnNearPlayer();
  const box=$('#bugs');
  box.innerHTML='';
  game.entities.forEach((e,index)=>{
    updateAI(e);
    const p=pos(e), d=Math.hypot(p.x,p.y), scale=Math.max(.5,1.22-d/620);
    const clue=!e.discovered && d<160;
    if(!e.discovered && !clue) return;
    const node=document.createElement('div');
    node.className='bug';
    node.style.transform=`translate(calc(50% + ${p.x}px),calc(50% + ${p.y}px)) translate(-50%,-50%) scale(${scale})`;
    node.style.filter=d>420?'blur(1px)':'';
    if(e.discovered){
      node.innerHTML=`<div class="sp" style="--c:${e.grade.color}">${bugImage(e.bug)}</div><div class="lab">${d<92?'채집 가능':'가까이'} · ${e.bug.name}</div>`;
      node.onclick=()=>d>92?toast('더 가까이 가야 해'):openCatch(index);
    }else{
      node.innerHTML='<div class="sp" style="font-size:30px">?</div><div class="lab">조사 필요 · 생태 신호</div>';
      node.onclick=()=>{
        if(d>110) toast('레이더 신호에 더 가까이 가야 해');
        else { e.discovered=true; toast(`${e.grade.name} ${e.bug.name} 발견!`); }
      };
    }
    box.appendChild(node);
  });
  renderRadar();
}
function movePlayer(forward,side){ game.player.x+=side; game.player.y-=forward; }
function openCatch(index){
  const e=game.entities[index];
  if(!e.discovered){ toast('먼저 레이더로 발견해야 해'); return; }
  e.signal=false;
  game.activeCatch=index;
  game.catchStart=performance.now();
  $('#target').style.setProperty('--c',e.grade.color);
  $('#target').innerHTML=bugImage(e.bug);
  $('#name').textContent=`${e.grade.name} ${e.bug.name}`;
  $('#enc').style.display='block';
}
function closeCatch(){ game.activeCatch=null; $('#enc').style.display='none'; }
function cursorPos(){ return (.5+.5*Math.sin((performance.now()-game.catchStart)*.001*Math.PI*2))*100; }
function judge(p){
  const d=Math.abs(p-50);
  if(d<7) return ['PERFECT',30,1.5];
  if(d<16) return ['GREAT',22,1.25];
  if(d<28) return ['GOOD',15,1.1];
  return ['MISS',0,.8];
}
function tryCatch(){
  if(game.activeCatch===null) return;
  const e=game.entities[game.activeCatch];
  const result=judge(cursorPos());
  const rate=Math.max(.1,Math.min(.95,e.grade.rate+(result[1]?.08:-.1)));
  if(Math.random()<rate && result[1]>0){
    const gain=Math.round(e.grade.pts*result[2]);
    game.points+=gain;
    game.caught[e.bug.name]=(game.caught[e.bug.name]||0)+1;
    game.lastEvent=`${e.grade.name} ${e.bug.name}를 만났다. 호박사: “오, 그건 나도 좀 보고 싶은데?”`;
    game.entities.splice(game.activeCatch,1);
    toast(`${result[0]}! 연구별 +${gain}`);
    closeCatch();
  }else toast('놓쳤다. 그래도 흔적은 남았다.');
}
function openModal(html){ $('#modalBody').innerHTML=html; $('#modal').style.display='block'; }
function openDex(){
  const html='<h2>곤충 앨범</h2>'+BUGS.map(b=>`<div class="dexitem">${bugImage(b)}<div><b>${b.name}</b><br>만난 수: ${game.caught[b.name]||0}<br><small>서식지: ${(b.habitat||[]).map(id=>regionById(id).name).join(', ')}<br>호박사 메모: ${game.caught[b.name]?'봤다. 귀엽다. 아마도.':'아직 못 봤다. 나도 궁금하다.'}</small></div></div>`).join('');
  openModal(html);
}
function tick(){
  const input=game.input;
  input.vx*=.86; input.vy*=.86;
  if(Math.abs(input.vx)+Math.abs(input.vy)>.001) movePlayer(input.vy*8,input.vx*8);
  renderWorld();
  if(game.activeCatch!==null){
    const p=cursorPos(), result=judge(p);
    $('#cur').style.left=`calc(${p}% - 3px)`;
    $('#judge').textContent=result[0];
  }
  requestAnimationFrame(tick);
}
function bind(){
  $('#start').onclick=startGame;
  $('#openDexTitle').onclick=()=>{ startGame(); openDex(); };
  $('#openDex').onclick=openDex;
  $('#diary').onclick=()=>openModal(`<h2>오늘의 탐험일기</h2><p>${game.lastEvent}</p>`);
  $('#home').onclick=()=>toast('호박사: 귀환석은 다음 버전에서 줄게. 지금은 걸어.');
  $('#closeModal').onclick=()=>$('#modal').style.display='none';
  $('#close').onclick=closeCatch;
  $('#catch').onclick=tryCatch;
  const field=$('#game');
  field.addEventListener('pointerdown',e=>{ game.input.dragging=true; game.input.lx=e.clientX; game.input.ly=e.clientY; });
  field.addEventListener('pointermove',e=>{
    if(!game.input.dragging) return;
    const dx=e.clientX-game.input.lx, dy=e.clientY-game.input.ly;
    game.input.lx=e.clientX; game.input.ly=e.clientY;
    game.input.vx=Math.max(-1,Math.min(1,dx*.025));
    game.input.vy=Math.max(-1,Math.min(1,-dy*.025));
  });
  field.addEventListener('pointerup',()=>game.input.dragging=false);
  field.addEventListener('pointercancel',()=>game.input.dragging=false);
}
bind();
requestAnimationFrame(tick);
