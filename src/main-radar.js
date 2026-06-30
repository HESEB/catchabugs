import { ASSET_BASE, MAP_ASSET_BASE, BUGS, GRADES } from './data/bugs.js';
import { updateInsectAI } from './insect-ai.js';
import { claimQuestReward, recordQuestCatch, renderQuestHTML } from './quest.js';

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
  catchBusy:false,
  seq:0,
  regionId:'forest',
  input:{ dragging:false, lx:0, ly:0, vx:0, vy:0 },
  keys:{},
  compass:{ heading:0, smooth:0, source:'DEV', enabled:false },
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
  map.style.background=`${r.color} url('${MAP_ASSET_BASE}${r.map}') center/260px repeat`;
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
function gradeRank(name){ return Math.max(0, GRADES.findIndex(g=>g.name===name)); }
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
  ensureCompassUI();
  injectCatchStyles();
  while(game.entities.length<8) spawnNearPlayer();
  toast('호박사: 이동은 그대로, 회전은 나침반으로만 바뀐다.');
}
function pos(e){ return { x:e.wx-game.player.x, y:e.wy-game.player.y }; }
function rotateByHeading(x,y){
  const a=-game.compass.smooth*Math.PI/180;
  const c=Math.cos(a), s=Math.sin(a);
  return { x:x*c-y*s, y:x*s+y*c };
}
function screenPos(e){
  const p=pos(e);
  return rotateByHeading(p.x,p.y);
}
function updateAI(e){
  updateInsectAI(e, {
    player: game.player,
    toast,
    random: Math.random,
    dt: 1
  });
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
function headingLabel(deg){
  const names=['N','NE','E','SE','S','SW','W','NW'];
  return `${names[Math.round(((deg%360)+360)%360/45)%8]} ${Math.round(((deg%360)+360)%360)}°`;
}
function smoothHeading(){
  let diff=((game.compass.heading-game.compass.smooth+540)%360)-180;
  game.compass.smooth=(game.compass.smooth+diff*.12+360)%360;
}
function radarItems(){
  return game.entities.map(e=>{
    const raw=pos(e);
    const rotated=rotateByHeading(raw.x,raw.y);
    return { e, dx:rotated.x, dy:rotated.y, d:Math.hypot(raw.x,raw.y) };
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
  smoothHeading();
  const r=currentRegion();
  applyRegion(r);
  $('#map').style.transform=`translate(${-game.player.x%260}px,${-game.player.y%260}px) rotate(${-game.compass.smooth}deg) scale(1.2)`;
  $('#pt').textContent=game.points;
  const headingNode=$('#headingText');
  if(headingNode) headingNode.textContent=`🧭 ${headingLabel(game.compass.smooth)} · ${game.compass.source}`;
  const slider=$('#headingSlider');
  if(slider && game.compass.source==='DEV') slider.value=Math.round(game.compass.heading);

  game.entities=game.entities.filter(e=>Math.hypot(e.wx-game.player.x,e.wy-game.player.y)<900);
  while(game.entities.length<8) spawnNearPlayer();
  const box=$('#bugs');
  box.innerHTML='';
  game.entities.forEach((e,index)=>{
    updateAI(e);
    const raw=pos(e), d=Math.hypot(raw.x,raw.y), p=screenPos(e), scale=Math.max(.5,1.22-d/620);
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
function applyKeyboardMovement(){
  let forward=0, side=0;
  if(game.keys.ArrowUp||game.keys.KeyW) forward+=1;
  if(game.keys.ArrowDown||game.keys.KeyS) forward-=1;
  if(game.keys.ArrowRight||game.keys.KeyD) side+=1;
  if(game.keys.ArrowLeft||game.keys.KeyA) side-=1;
  if(forward||side) movePlayer(forward*5,side*5);
}
function openCatch(index){
  const e=game.entities[index];
  if(!e.discovered){ toast('먼저 레이더로 발견해야 해'); return; }
  e.signal=false;
  game.activeCatch=index;
  game.catchStart=performance.now();
  game.catchBusy=false;
  resetCatchFx();
  $('#target').style.setProperty('--c',e.grade.color);
  $('#target').innerHTML=bugImage(e.bug);
  $('#name').textContent=`${e.grade.name} ${e.bug.name}`;
  $('#judge').textContent='타이밍!';
  $('#catch').disabled=false;
  $('#enc').style.display='block';
}
function closeCatch(){
  game.activeCatch=null;
  game.catchBusy=false;
  resetCatchFx();
  $('#enc').style.display='none';
}
function cursorPos(){ return (.5+.5*Math.sin((performance.now()-game.catchStart)*.001*Math.PI*2))*100; }
function judge(p){
  const d=Math.abs(p-50);
  if(d<7) return ['PERFECT',30,1.5];
  if(d<16) return ['GREAT',22,1.25];
  if(d<28) return ['GOOD',15,1.1];
  return ['MISS',0,.8];
}
function recordCatch(e,result,gain){
  const key=e.bug.name;
  const old=game.caught[key];
  const rec=typeof old==='object'&&old?old:{ count:Number(old||0), bestGrade:null, bestJudge:null, bestScore:0, firstSeen:null };
  rec.count+=1;
  rec.firstSeen=rec.firstSeen || new Date().toLocaleDateString('ko-KR');
  rec.bestScore=Math.max(rec.bestScore||0,gain);
  if(!rec.bestGrade || gradeRank(e.grade.name)>gradeRank(rec.bestGrade)) rec.bestGrade=e.grade.name;
  if(!rec.bestJudge || judgeRank(result[0])>judgeRank(rec.bestJudge)) rec.bestJudge=result[0];
  game.caught[key]=rec;
}
function judgeRank(name){ return {MISS:0,GOOD:1,GREAT:2,PERFECT:3}[name]||0; }
function playCatchSound(type){ return type; }
function vibrate(pattern){ if(navigator.vibrate) navigator.vibrate(pattern); }
function resetCatchFx(){
  const enc=$('#enc');
  if(!enc) return;
  enc.classList.remove('catch-swing','catch-success','catch-miss','catch-perfect','catch-great','catch-good');
  const fx=enc.querySelector('.catchFx');
  if(fx) fx.remove();
}
function spawnCatchFx(kind, text){
  const stage=document.querySelector('#enc .stage');
  if(!stage) return;
  const fx=document.createElement('div');
  fx.className=`catchFx ${kind}`;
  const icons=kind==='success' ? ['✨','⭐','✦','💫','✨','⭐'] : ['💨','〰️','💨','·','〰️'];
  fx.innerHTML=`<b>${text}</b>${icons.map((icon,i)=>`<span style="--i:${i}">${icon}</span>`).join('')}`;
  stage.appendChild(fx);
  setTimeout(()=>fx.remove(),900);
}
function reactTarget(success, resultName){
  const enc=$('#enc');
  enc.classList.add(success?'catch-success':'catch-miss');
  if(resultName==='PERFECT') enc.classList.add('catch-perfect');
  if(resultName==='GREAT') enc.classList.add('catch-great');
  if(resultName==='GOOD') enc.classList.add('catch-good');
}
function finishCatch(e,result,rate){
  const success=Math.random()<rate && result[1]>0;
  reactTarget(success,result[0]);
  if(success){
    const gain=Math.round(e.grade.pts*result[2]);
    game.points+=gain;
    recordCatch(e,result,gain);
    recordQuestCatch({ bug:e.bug, grade:e.grade, judge:result[0], gain });
    game.lastEvent=`${e.grade.name} ${e.bug.name}를 만났다. 호박사: “오, 그건 나도 좀 보고 싶은데?”`;
    game.entities.splice(game.activeCatch,1);
    $('#pt').textContent=game.points;
    $('#judge').textContent=`${result[0]}! +${gain}`;
    spawnCatchFx('success',`${result[0]}!`);
    vibrate(result[0]==='PERFECT'?[18,30,18]:[24]);
    playCatchSound('success');
    setTimeout(()=>{ toast(`${result[0]}! 연구별 +${gain}`); closeCatch(); },720);
  }else{
    $('#judge').textContent='MISS! 놓쳤다';
    spawnCatchFx('miss','놓쳤다!');
    vibrate([70,40,70]);
    playCatchSound('miss');
    e.signal=true;
    e.drift+=Math.PI*.35;
    setTimeout(()=>{ game.catchBusy=false; $('#catch').disabled=false; toast('놓쳤다. 그래도 흔적은 남았다.'); resetCatchFx(); },780);
  }
}
function tryCatch(){
  if(game.activeCatch===null || game.catchBusy) return;
  const e=game.entities[game.activeCatch];
  if(!e) return;
  game.catchBusy=true;
  $('#catch').disabled=true;
  const result=judge(cursorPos());
  const rate=Math.max(.1,Math.min(.95,e.grade.rate+(result[1] ? .08 : -.1)));
  $('#enc').classList.add('catch-swing');
  $('#judge').textContent='채집망 휘두르는 중!';
  playCatchSound('swing');
  vibrate(12);
  setTimeout(()=>finishCatch(e,result,rate),330);
}
function openModal(html){ $('#modalBody').innerHTML=html; $('#modal').style.display='block'; }
function caughtRecord(bug){
  const rec=game.caught[bug.name];
  if(typeof rec==='number') return { count:rec, bestGrade:null, bestJudge:null, bestScore:0, firstSeen:null };
  return rec || { count:0, bestGrade:null, bestJudge:null, bestScore:0, firstSeen:null };
}
function openDex(){
  const total=BUGS.length;
  const found=BUGS.filter(b=>caughtRecord(b).count>0).length;
  const percent=Math.round((found/total)*100);
  const cards=BUGS.map(b=>{
    const rec=caughtRecord(b);
    const foundIt=rec.count>0;
    const habitats=(b.habitat||[]).map(id=>`${regionById(id).mark} ${regionById(id).name}`).join(' · ');
    const best=rec.bestGrade || '미확인';
    const judgeLabel=rec.bestJudge || '-';
    const image=foundIt ? bugImage(b) : `<div class="dexUnknown">${b.emoji}</div>`;
    return `<article class="dexCard ${foundIt?'found':'locked'}">
      <div class="dexImage">${image}</div>
      <div class="dexInfo">
        <div class="dexTop"><b>${foundIt?b.name:'???'}</b><span>${foundIt?'발견':'미발견'}</span></div>
        <div class="dexMeta">서식지: ${habitats || '미상'}</div>
        <div class="dexStats"><span>만난 수 ${rec.count}</span><span>최고 ${best}</span><span>판정 ${judgeLabel}</span></div>
        <small>호박사 메모: ${foundIt?'기록 완료. 더 좋은 판정과 희귀도를 노려보자.':'레이더 신호를 따라가면 발견할 수 있다.'}</small>
      </div>
    </article>`;
  }).join('');
  openModal(`<div class="dexHeader"><h2>곤충 앨범</h2><div>${found}/${total} · ${percent}%</div></div><div class="dexProgress"><i style="width:${percent}%"></i></div><div class="dexGrid">${cards}</div>`);
}
function openQuest(){
  openModal(renderQuestHTML());
  document.querySelectorAll('[data-quest-id]').forEach(btn=>{
    btn.onclick=()=>{
      const result=claimQuestReward(btn.dataset.questId, game.points);
      if(!result.ok) return;
      game.points=result.points;
      $('#pt').textContent=game.points;
      toast(`MISSION CLEAR! +${result.reward} 연구별`);
      openQuest();
    };
  });
}
function tick(){
  const input=game.input;
  input.vx*=.86; input.vy*=.86;
  applyKeyboardMovement();
  if(Math.abs(input.vx)+Math.abs(input.vy)>.001) movePlayer(input.vy*8,input.vx*8);
  renderWorld();
  if(game.activeCatch!==null && !game.catchBusy){
    const p=cursorPos(), result=judge(p);
    $('#cur').style.left=`calc(${p}% - 3px)`;
    $('#judge').textContent=result[0];
  }
  requestAnimationFrame(tick);
}
function ensureCompassUI(){
  if($('#compassPanel')) return;
  const panel=document.createElement('div');
  panel.id='compassPanel';
  panel.style.cssText='position:absolute;left:10px;top:62px;z-index:12;width:170px;padding:9px 10px;border-radius:18px;background:#07111ee8;color:white;border:1px solid #ffffff33;box-shadow:0 14px 30px #0006;font-weight:900;font-size:11px;box-sizing:border-box';
  panel.innerHTML=`<div id="headingText">🧭 N 0° · DEV</div><input id="headingSlider" type="range" min="0" max="359" value="0" style="width:100%;margin:7px 0 4px"><button id="compassBtn" type="button" style="width:100%;border:0;border-radius:12px;padding:7px;font-weight:1000;background:#9af7ff;color:#07111e">모바일 나침반 켜기</button><div style="opacity:.75;margin-top:5px">키보드/드래그는 이동만</div>`;
  $('#game').appendChild(panel);
  $('#headingSlider').addEventListener('input',e=>{
    game.compass.source='DEV';
    game.compass.heading=Number(e.target.value)||0;
  });
  $('#compassBtn').onclick=enableDeviceCompass;
}
function injectCatchStyles(){
  if($('#catchActionStyles')) return;
  const style=document.createElement('style');
  style.id='catchActionStyles';
  style.textContent=`
    #enc .net{transform-origin:78% 82%;transition:filter .2s}
    #enc.catch-swing .net{animation:netSwing .42s cubic-bezier(.2,1.3,.3,1) both;filter:drop-shadow(0 0 18px #fff)}
    #enc.catch-success .panel{animation:panelBump .42s ease both}
    #enc.catch-success .target{animation:targetCaught .55s ease both;box-shadow:0 0 28px var(--c,#ffd166),0 0 60px #fff8}
    #enc.catch-miss .target{animation:targetEscape .62s ease both}
    #enc.catch-perfect .stage:after{content:'';position:absolute;inset:0;background:radial-gradient(circle,#ffffff99,transparent 42%);animation:flashOut .5s ease both;pointer-events:none}
    #catch:disabled{opacity:.55;filter:grayscale(.35)}
    .catchFx{position:absolute;inset:0;pointer-events:none;z-index:5;display:flex;align-items:center;justify-content:center;font-weight:1000;color:white;text-shadow:0 5px 15px #000}
    .catchFx b{position:absolute;top:20px;left:50%;transform:translateX(-50%);font-size:28px;letter-spacing:.04em;white-space:nowrap;animation:fxTitle .75s ease both}
    .catchFx span{position:absolute;left:50%;top:48%;font-size:24px;animation:fxParticle .78s ease both;animation-delay:calc(var(--i)*.035s)}
    .catchFx.success span:nth-child(2){--x:-86px;--y:-52px}.catchFx.success span:nth-child(3){--x:72px;--y:-72px}.catchFx.success span:nth-child(4){--x:-42px;--y:54px}.catchFx.success span:nth-child(5){--x:94px;--y:36px}.catchFx.success span:nth-child(6){--x:-104px;--y:18px}.catchFx.success span:nth-child(7){--x:24px;--y:-96px}
    .catchFx.miss span{--x:84px;--y:-18px;opacity:.8}
    @keyframes netSwing{0%{transform:rotate(0) translate(0,0) scale(1)}45%{transform:rotate(-58deg) translate(-54px,-60px) scale(1.04)}100%{transform:rotate(-20deg) translate(-22px,-22px) scale(1)}}
    @keyframes panelBump{0%{transform:translateX(-50%) scale(1)}35%{transform:translateX(-50%) scale(1.035)}100%{transform:translateX(-50%) scale(1)}}
    @keyframes targetCaught{0%{transform:translate(-50%,-50%) scale(1)}55%{transform:translate(-50%,-50%) scale(1.18) rotate(-5deg)}100%{transform:translate(-50%,-50%) scale(.08) rotate(18deg);opacity:0}}
    @keyframes targetEscape{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-125%) scale(.72) rotate(18deg);opacity:0}}
    @keyframes flashOut{0%{opacity:0}30%{opacity:1}100%{opacity:0}}
    @keyframes fxTitle{0%{opacity:0;transform:translate(-50%,12px) scale(.9)}35%{opacity:1;transform:translate(-50%,0) scale(1.08)}100%{opacity:0;transform:translate(-50%,-18px) scale(1)}}
    @keyframes fxParticle{0%{transform:translate(-50%,-50%) scale(.4);opacity:0}30%{opacity:1}100%{transform:translate(calc(-50% + var(--x,70px)),calc(-50% + var(--y,-50px))) scale(1.25);opacity:0}}
  `;
  document.head.appendChild(style);
}
async function enableDeviceCompass(){
  try{
    if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){
      const res=await DeviceOrientationEvent.requestPermission();
      if(res!=='granted'){ toast('나침반 권한이 거부됐어'); return; }
    }
    window.addEventListener('deviceorientation',onDeviceOrientation,true);
    game.compass.enabled=true;
    game.compass.source='GPS';
    toast('모바일 나침반 연결');
  }catch(err){ toast('나침반 연결 실패. DEV 슬라이더 사용'); }
}
function onDeviceOrientation(e){
  const heading=typeof e.webkitCompassHeading==='number' ? e.webkitCompassHeading : (360-(e.alpha||0));
  if(Number.isFinite(heading)){
    game.compass.heading=((heading%360)+360)%360;
    game.compass.source='GPS';
  }
}
function bind(){
  $('#start').onclick=startGame;
  $('#openDexTitle').onclick=()=>{ startGame(); openDex(); };
  $('#openDex').onclick=openDex;
  $('#openQuest').onclick=openQuest;
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
  window.addEventListener('keydown',e=>{ game.keys[e.code]=true; });
  window.addEventListener('keyup',e=>{ game.keys[e.code]=false; });
}
bind();
requestAnimationFrame(tick);
