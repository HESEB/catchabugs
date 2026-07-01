const SETTINGS_STATE_KEY = 'catchabugs.menuState.v541';
function $(s){return document.querySelector(s)}
function parse(v){try{return v?JSON.parse(v):null}catch{return null}}
function body(){return $('#modalBody')}
function setState(current,parent=null){const x={current,parent,at:Date.now()};sessionStorage.setItem(SETTINGS_STATE_KEY,JSON.stringify(x));const b=body();if(b)b.dataset.menuState=JSON.stringify(x)}
function close(){const m=$('#modal');if(m)m.style.display='none';sessionStorage.removeItem(SETTINGS_STATE_KEY)}
function txt(){return (body()?.textContent||'').replace(/\s+/g,' ')}
function ttl(){const b=body();return (b?.querySelector('.menuHubHeader h2')?.textContent||b?.querySelector('.modalGuardTitle')?.textContent||b?.querySelector('h2')?.textContent||'').replace(/\s+/g,' ')}
function openSettingsHub(){setState('settings');const btn=$('#menuHub-settings');if(btn){btn.click();return}close()}
function isSettingsMain(){const t=txt(),h=ttl();return h.includes('설정')&&t.includes('사운드')&&t.includes('진동')&&t.includes('개발자모드')}
function isDeveloper(){const h=ttl(),t=txt();return h.includes('개발자모드')||t.includes('웜칩 +100')||t.includes('탐사코어 +20')||t.includes('NPC 테스트')||t.includes('디버그')}
function isSave(){const h=ttl(),t=txt();return h.includes('저장')||t.includes('백업')||t.includes('불러오기')||t.includes('초기화')||t.includes('현재 진행상황 저장')}
function sync(){const m=$('#modal');if(!m||m.style.display==='none')return;if(isSettingsMain())setState('settings');else if(isDeveloper())setState('developer','settings');else if(isSave())setState('save','settings')}
function back(e){sync();const t=txt();if(isDeveloper()||isSave()){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();openSettingsHub();return true}if(isSettingsMain()){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();close();return true}return false}
function patch(){const b=$('[data-modal-back]');if(!b)return;b.addEventListener('pointerdown',back,true);b.addEventListener('click',back,true)}
function capture(){if(document.documentElement.dataset.engine549SettingsCapture==='on')return;document.documentElement.dataset.engine549SettingsCapture='on';document.addEventListener('click',e=>{if(e.target.closest?.('#menuHub-settings'))setState('settings');const p=e.target.closest?.('[data-panel]');if(p?.dataset.panel==='developer')setState('developer','settings');const target=e.target.closest?.('[data-target]');if(target?.dataset.target==='openSave')setState('save','settings')},true)}
function tick(){capture();sync();patch();setTimeout(tick,250)}
document.addEventListener('DOMContentLoaded',()=>setTimeout(tick,500));setTimeout(tick,1200);
