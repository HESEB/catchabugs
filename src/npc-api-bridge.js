function $(selector){return document.querySelector(selector)}
const fallbackState={seq:0,npcs:[]};
function toast(message){const node=$('#toast');if(!node)return;node.textContent=message;node.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.style.display='none',1300)}
function gameApi(){return window.CATCHABUGS_GAME||null}
function player(){return gameApi()?.getPlayer?.()||{x:0,y:0}}
function ensureLayer(){let layer=$('#npcLayer');if(layer)return layer;const game=$('#game');if(!game)return null;layer=document.createElement('div');layer.id='npcLayer';layer.style.cssText='position:absolute;inset:0;z-index:33;pointer-events:none;overflow:hidden';game.appendChild(layer);return layer}
function addLog(text,icon='💬'){gameApi()?.addLog?.(text,icon)}
function addPoints(n){gameApi()?.addPoints?.(n)}
function makeNpc(type='visible'){
  const p=player();
  const data={
    id:`bridge-${++fallbackState.seq}`,
    type,
    x:p.x+60+Math.random()*90,
    y:p.y+40+Math.random()*70,
    icon:type==='merchant'?'🧑‍💼':type==='collector'?'🧺':type==='hidden'?'?':'🧢',
    name:type==='merchant'?'떠돌이 상인':type==='collector'?'표본 수집가':type==='hidden'?'미확인 신호':'떠돌이 채집가'
  };
  fallbackState.npcs.push(data);
  render();
  addLog(`${data.name} 생성`,data.icon);
  return fallbackState.npcs.length;
}
function render(){const layer=ensureLayer();if(!layer)return;layer.innerHTML='';const p=player();fallbackState.npcs.forEach(npc=>{const x=npc.x-p.x,y=npc.y-p.y;const btn=document.createElement('button');btn.type='button';btn.className='fieldNpc';btn.style.cssText=`position:absolute;left:50%;top:50%;transform:translate(calc(-50% + ${x}px),calc(-50% + ${y}px));pointer-events:auto;touch-action:manipulation;border:0;background:transparent;z-index:34;display:flex;flex-direction:column;align-items:center;gap:4px`;btn.innerHTML=`<span style="width:48px;height:48px;border-radius:18px;background:#fffffff0;display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 0 0 2px #9af7ff,0 8px 16px #0006">${npc.icon}</span><b style="max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#07111ee8;color:white;border-radius:999px;padding:4px 8px;font-size:10px">${npc.name}</b>`;btn.onclick=e=>{e.preventDefault();e.stopPropagation();openNpc(npc)};layer.appendChild(btn)})}
function openNpc(npc){const body=$('#modalBody'),modal=$('#modal');if(!body||!modal)return;const reward=npc.type==='hidden'?8:5;addPoints(reward);addLog(`${npc.name}와 대화 완료`,npc.icon);body.innerHTML=`<div class="npcSheet"><div style="display:flex;gap:12px;align-items:center;margin-bottom:12px"><div style="width:64px;height:64px;border-radius:22px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:40px">${npc.icon}</div><div><h2 style="margin:0">${npc.name}</h2><b style="color:#0f6f56">NPC 테스트</b></div></div><div class="compactList"><b>대화 완료</b><p>${npc.type==='hidden'?'곤충 신호처럼 보였지만 NPC였습니다.':'필드에서 만난 NPC입니다.'}<br>보상: 웜칩 +${reward}</p></div><button id="npcBridgeClose" style="width:100%;border:0;border-radius:16px;background:#07111e;color:white;padding:14px;font-weight:1000">게임으로</button></div>`;modal.style.display='block';$('#npcBridgeClose')?.addEventListener('click',()=>modal.style.display='none')}
function installFallback(){if(window.CATCHABUGS_RANDOM_NPC)return;window.CATCHABUGS_RANDOM_NPC={spawnVisible(){return makeNpc('visible')},spawnHidden(){return makeNpc('hidden')},spawnMerchant(){return makeNpc('merchant')},spawnCollector(){return makeNpc('collector')},list(){return fallbackState.npcs.slice()},clear(){fallbackState.npcs=[];render()},notes(){return[]},renderNpcNotesHTML(){return'<div class="compactList"><b>NPC 기록 없음</b><p>NPC를 만나면 이곳에 기록됩니다.</p></div>'}};document.documentElement.dataset.npcBridge='fallback'}
function tick(){installFallback();render();setTimeout(tick,800)}
document.addEventListener('DOMContentLoaded',()=>setTimeout(tick,1800));setTimeout(tick,2400);
