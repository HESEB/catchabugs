const CORE_SAVE_KEY = 'catchabugs.core.v2';
const QUEST_KEY = 'catchabugs.quest.v1';
const ACHIEVEMENT_KEY = 'catchabugs.achievement.v1';
const BADGE_KEY = 'catchabugs.badgeTitle.v1';
const SAVE_VERSION = 2;

function safeParse(raw) {
  try { return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

function safeString(value) {
  try { return JSON.stringify(value, null, 2); }
  catch { return '{}'; }
}

function pickCore(game = {}) {
  return {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    points: Number(game.points || 0),
    caught: game.caught || {},
    player: {
      x: Number(game.player?.x || 0),
      y: Number(game.player?.y || 0),
    },
    regionId: game.regionId || 'forest',
    lastEvent: game.lastEvent || '',
    log: Array.isArray(game.log) ? game.log.slice(0, 100) : [],
  };
}

export function saveCoreGame(game) {
  const core = pickCore(game);
  localStorage.setItem(CORE_SAVE_KEY, JSON.stringify(core));
  return core;
}

export function loadCoreSave() {
  return safeParse(localStorage.getItem(CORE_SAVE_KEY));
}

export function applySaveData(game, core) {
  if (!game || !core) return false;
  game.points = Number(core.points || 0);
  game.caught = core.caught || {};
  game.player.x = Number(core.player?.x || 0);
  game.player.y = Number(core.player?.y || 0);
  game.regionId = core.regionId || game.regionId;
  game.lastEvent = core.lastEvent || game.lastEvent;
  game.log = Array.isArray(core.log) ? core.log.slice(0, 100) : [];
  return true;
}

export function exportSaveData(game) {
  const bundle = {
    type: 'CATCHABUGS_SAVE',
    version: SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    core: pickCore(game),
    quest: safeParse(localStorage.getItem(QUEST_KEY)),
    achievement: safeParse(localStorage.getItem(ACHIEVEMENT_KEY)),
    badgeTitle: safeParse(localStorage.getItem(BADGE_KEY)),
  };
  return safeString(bundle);
}

export function importSaveText(text) {
  const bundle = safeParse(text);
  if (!bundle || bundle.type !== 'CATCHABUGS_SAVE' || !bundle.core) {
    return { ok: false, message: '저장 데이터 형식이 올바르지 않습니다.' };
  }

  localStorage.setItem(CORE_SAVE_KEY, JSON.stringify(bundle.core));
  if (bundle.quest) localStorage.setItem(QUEST_KEY, JSON.stringify(bundle.quest));
  if (bundle.achievement) localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(bundle.achievement));
  if (bundle.badgeTitle) localStorage.setItem(BADGE_KEY, JSON.stringify(bundle.badgeTitle));

  return { ok: true, core: bundle.core, message: '저장 데이터를 불러왔습니다.' };
}

export function renderSaveHTML(game) {
  const core = pickCore(game);
  const foundCount = Object.keys(core.caught || {}).length;
  const saveText = exportSaveData(game).replace(/</g, '&lt;');
  const saved = loadCoreSave();
  const savedAt = saved?.savedAt ? new Date(saved.savedAt).toLocaleString('ko-KR') : '아직 없음';

  return `<div class="saveHeader"><h2>저장 시스템 v2</h2><div>자동저장</div></div>
    <style>
      .saveHeader{display:flex;justify-content:space-between;align-items:flex-end;margin:8px 2px 12px}.saveHeader h2{margin:0}.saveHeader div{font-size:12px;font-weight:1000;color:#0f6f56}.savePanel{padding:12px;border-radius:20px;background:linear-gradient(135deg,#fff,#f4f8ff);box-shadow:0 8px 18px #0001;border:1px solid #0000000d;margin:9px 0}.savePanel.danger{background:linear-gradient(135deg,#fff,#fff4f4);border-color:#ff7b7b55}.saveStats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}.saveStats span{border-radius:14px;background:#0000000a;padding:9px;font-size:12px;font-weight:1000}.savePanel p{font-size:12px;color:#0009;font-weight:800;line-height:1.45}.savePanel textarea{width:100%;min-height:130px;box-sizing:border-box;border:1px solid #0002;border-radius:14px;padding:10px;font-family:ui-monospace,Consolas,monospace;font-size:10px;resize:vertical}.saveActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.saveActions button{flex:1;min-width:120px;border:0;border-radius:13px;padding:10px;font-weight:1000;background:#07111e;color:white}.saveActions button.danger{background:#c62828;color:white}
    </style>
    <div class="savePanel">
      <b>현재 저장 요약</b>
      <div class="saveStats"><span>웜칩 ${core.points}</span><span>도감 ${foundCount}종</span><span>최근 저장 ${savedAt}</span><span>탐험기록 ${core.log.length}개</span></div>
      <p>채집 성공, 퀘스트/업적 보상 수령 시 자동 저장됩니다. 아래 백업 코드를 복사해두면 다른 브라우저에서도 복원할 수 있습니다.</p>
      <textarea id="saveExport" readonly>${saveText}</textarea>
      <div class="saveActions"><button id="copySave">백업 복사</button><button id="manualSave">지금 저장</button></div>
    </div>
    <div class="savePanel">
      <b>백업 복원</b>
      <p>복원할 백업 코드를 아래에 붙여넣고 불러오기를 누르세요.</p>
      <textarea id="saveImport" placeholder="백업 코드를 붙여넣기"></textarea>
      <div class="saveActions"><button id="loadSave">불러오기</button></div>
    </div>
    <div class="savePanel danger">
      <b>데이터 초기화</b>
      <p>현재 브라우저에 저장된 게임 진행, 배낭, 연구소, BUG HOLE, 활성 아이템 데이터를 초기화합니다. 백업이 없다면 복구할 수 없습니다.</p>
      <div class="saveActions"><button id="resetAllData" class="danger">데이터 초기화</button></div>
    </div>`;
}