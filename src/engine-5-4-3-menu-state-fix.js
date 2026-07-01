const MENU_STATE_FIX_KEY = 'catchabugs.menuState.v541';
function $(s){return document.querySelector(s)}
function parse(v){try{return v?JSON.parse(v):null}catch{return null}}
function body(){return $('#modalBody')}
function state(){const b=body();return parse(b?.dataset?.menuState)||parse(sessionStorage.getItem(MENU_STATE_FIX_KEY))}
function setState(current,parent=null){const x={current,parent,at:Date.now()};sessionStorage.setItem(MENU_STATE_FIX_KEY,JSON.stringify(x));const b=body();if(b)b.dataset.menuState=JSON.stringify(x)}
function close(){const m=$('#modal');if(m)m.style.display='none';sessionStorage.removeItem(MENU_STATE_FIX_KEY)}
function text(){return (body()?.textContent||'').replace(/\s+/g,' ')}
function title(){const b=body();return (b?.querySelector('.menuHubHeader h2')?.textContent||b?.querySelector('.modalGuardTitle')?.textContent||b?.querySelector('h2')?.textContent||'').replace(/\s+/g,' ')}
function isBag(){const b=body();const t=text();return !!b?.querySelector('.bagSheet')||t.includes('🎒 배낭')||t.includes('활성 설치물')||t.includes('소비 설치 장비 재료 특수')}
function isQuestMain(){const t=text();const h=title();return h.includes('퀘스트')&&t.includes('Mission / 업적')&&t.includes('미션')&&t.includes('업적')&&t.includes('칭호')}
function isQuestChild(){const h=title();const t=text();return !isQuestMain()&&(h.includes('미션')||h.includes('Mission')||h.includes('업적')||h.includes('칭호')||t.includes('일일미션')||t.includes('메인 미션')||t.includes('누적 플레이 업적')||t.includes('메인 퀘스트')||t.includes('서브 퀘스트'))}
function sync(){const m=$('#modal');if(!m||m.style.display==='none')return;if(isBag()){setState('bag');return}if(isQuestMain()){setState('quest');return}if(isQuestChild())setState('questChild','quest')}
function openQuest(){setState('quest');const b=$('#menuHub-quest');if(b){b.click();return}close()}
function back(e){sync();const s=state();if(isBag()||s?.current==='bag'||s?.current==='bagItem'||s?.parent==='bag'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();close();return true}if(isQuestChild()||s?.current==='questChild'||s?.parent==='quest'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();openQuest();return true}if(isQuestMain()||s?.current==='quest'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();close();return true}return false}
function patch(){const b=$('[data-modal-back]');if(!b)return;b.textContent='← 뒤로';b.onpointerdown=back;b.onclick=back;b.dataset.engine544Back='on'}
function capture(){if(document.documentElement.dataset.engine544Capture==='on')return;document.documentElement.dataset.engine544Capture='on';document.addEventListener('click',e=>{if(e.target.closest?.('#menuHub-bag'))setState('bag');if(e.target.closest?.('[data-bag-tab]'))setState('bag');if(e.target.closest?.('[data-use-item],[data-equip]'))setState('bagItem','bag');if(e.target.closest?.('#menuHub-quest'))setState('quest');const target=e.target.closest?.('[data-target]');const id=target?.dataset.target;if(id==='openQuest'||id==='openAchievement'||id==='openBadgeTitle')setState('questChild','quest');if(e.target.closest?.('[data-menu-role="mission"]'))setState('questChild','quest')},true)}
function tick(){capture();sync();patch();setTimeout(tick,120)}
document.addEventListener('DOMContentLoaded',()=>setTimeout(tick,500));setTimeout(tick,1200);
