import { ASSET_BASE, BUGS, GRADES } from './data/bugs.js';

const $ = (selector) => document.querySelector(selector);
const game = {
  player: { x: 0, y: 0 },
  points: 0,
  entities: [],
  caught: {},
  activeCatch: null,
  catchStart: 0,
  input: { dragging: false, lx: 0, ly: 0, vx: 0, vy: 0 },
  lastEvent: '오늘은 아직 특별한 일이 없었다. 호박사: “그런 날도 있는 거지.”'
};

function bugImage(bug) {
  return `<img src="${ASSET_BASE}insects/${bug.file}" onerror="this.remove();this.parentNode.textContent='${bug.emoji}'">`;
}

function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.style.display = 'none', 1300);
}

function pickGrade() {
  const r = Math.random();
  if (r < .004) return GRADES[8];
  if (r < .018) return GRADES[7];
  if (r < .055) return GRADES[6];
  if (r < .13) return GRADES[5];
  if (r < .27) return GRADES[4];
  if (r < .45) return GRADES[3];
  if (r < .65) return GRADES[2];
  if (r < .83) return GRADES[1];
  return GRADES[0];
}

function spawnNearPlayer() {
  const bug = BUGS[Math.floor(Math.random() * BUGS.length)];
  const grade = pickGrade();
  const angle = Math.random() * Math.PI * 2;
  const distance = 130 + Math.random() * 360;
  game.entities.push({
    bug,
    grade,
    wx: game.player.x + Math.cos(angle) * distance,
    wy: game.player.y + Math.sin(angle) * distance,
    signal: Math.random() < .35,
    drift: Math.random() * Math.PI * 2,
    mood: Math.random() < .2 ? 'shy' : 'calm'
  });
}

function startGame() {
  $('#title').style.display = 'none';
  $('#game').style.display = 'block';
  while (game.entities.length < 8) spawnNearPlayer();
  toast('호박사: 구조를 나눴다. 이제 덜 엉킬 거야. 아마도.');
}

function screenPos(entity) {
  return {
    x: entity.wx - game.player.x,
    y: entity.wy - game.player.y
  };
}

function updateBugAI(entity) {
  entity.drift += .012;
  const p = screenPos(entity);
  const d = Math.hypot(p.x, p.y);
  const speed = entity.grade.speed;

  if (entity.bug.behavior === 'flutter') {
    entity.wx += Math.sin(entity.drift * 1.8) * .18 * speed;
    entity.wy += Math.cos(entity.drift * 1.1) * .14 * speed;
  } else if (entity.bug.behavior === 'jump') {
    if (Math.random() < .012) {
      entity.wx += (Math.random() * 2 - 1) * 14;
      entity.wy += (Math.random() * 2 - 1) * 14;
    }
  } else if (entity.bug.behavior === 'dart') {
    entity.wx += Math.sin(entity.drift * 2.7) * .25 * speed;
    entity.wy += Math.cos(entity.drift * 2.1) * .2 * speed;
  } else {
    entity.wx += Math.sin(entity.drift) * .06 * speed;
    entity.wy += Math.cos(entity.drift * .7) * .05 * speed;
  }

  if (d < 80 && entity.mood === 'shy' && Math.random() < .012) {
    const away = Math.atan2(p.y, p.x);
    entity.wx += Math.cos(away) * 40;
    entity.wy += Math.sin(away) * 40;
    entity.signal = true;
    toast('깜짝! 뭔가 풀숲으로 움직였다.');
  }
}

function renderRadar() {
  const screen = $('#radarScreen');
  if (!screen) return;

  const range = 620;
  const radius = 48;
  const blips = game.entities
    .map(entity => {
      const dx = entity.wx - game.player.x;
      const dy = entity.wy - game.player.y;
      return { entity, dx, dy, distance: Math.hypot(dx, dy) };
    })
    .filter(item => item.distance <= range)
    .sort((a, b) => a.distance - b.distance);

  screen.querySelectorAll('.radar-blip').forEach(node => node.remove());

  blips.slice(0, 14).forEach(item => {
    const node = document.createElement('div');
    const threatClass = item.entity.signal ? ' signal' : '';
    node.className = `radar-blip${threatClass}`;
    node.style.setProperty('--c', item.entity.grade.color);
    node.style.left = `${50 + (item.dx / range) * radius}%`;
    node.style.top = `${50 + (item.dy / range) * radius}%`;
    node.title = `${item.entity.grade.name} ${item.entity.bug.name}`;
    screen.appendChild(node);
  });

  $('#radarCount').textContent = blips.length;
  if (blips.length) {
    const near = blips[0];
    const step = Math.max(1, Math.round(near.distance / 45));
    const direction = Math.abs(near.dx) > Math.abs(near.dy)
      ? (near.dx > 0 ? '오른쪽' : '왼쪽')
      : (near.dy > 0 ? '아래쪽' : '위쪽');
    $('#radarHint').textContent = `${direction} ${step}걸음 · ${near.entity.signal ? '생태 신호' : near.entity.bug.name}`;
  } else {
    $('#radarHint').textContent = '주변 신호 없음';
  }
}

function renderWorld() {
  $('#map').style.transform = `translate(${-game.player.x % 260}px,${-game.player.y % 260}px) scale(1.2)`;
  $('#pt').textContent = game.points;

  game.entities = game.entities.filter(e => Math.hypot(e.wx - game.player.x, e.wy - game.player.y) < 900);
  while (game.entities.length < 8) spawnNearPlayer();

  const box = $('#bugs');
  box.innerHTML = '';
  game.entities.forEach((entity, index) => {
    updateBugAI(entity);
    const p = screenPos(entity);
    const d = Math.hypot(p.x, p.y);
    const scale = Math.max(.5, 1.22 - d / 620);
    const unknown = entity.signal && d > 120;
    const node = document.createElement('div');
    node.className = 'bug';
    node.style.transform = `translate(calc(50% + ${p.x}px),calc(50% + ${p.y}px)) translate(-50%,-50%) scale(${scale})`;
    node.style.filter = d > 420 ? 'blur(1px)' : '';
    node.innerHTML = `${unknown ? '<div class="sp" style="font-size:30px">?</div>' : `<div class="sp" style="--c:${entity.grade.color}">${bugImage(entity.bug)}</div>`}<div class="lab">${d < 92 ? '조사 가능' : '가까이'} · ${unknown ? '생태 신호' : entity.bug.name}</div>`;
    node.onclick = () => d > 92 ? toast('더 가까이 가야 해') : openCatch(index);
    box.appendChild(node);
  });
  renderRadar();
}

function movePlayer(forward, side) {
  game.player.x += side;
  game.player.y -= forward;
}

function openCatch(index) {
  const entity = game.entities[index];
  entity.signal = false;
  if (Math.random() < .12) {
    game.points += 5;
    game.lastEvent = '생태 신호인 줄 알았는데 자연해호가였다. 호박사: “이름은 좀 이상하지만 좋은 사람이야.”';
    game.entities.splice(index, 1);
    toast('착각이었다! 자연해호가였다. 연구별 +5');
    return;
  }
  game.activeCatch = index;
  game.catchStart = performance.now();
  $('#target').style.setProperty('--c', entity.grade.color);
  $('#target').innerHTML = bugImage(entity.bug);
  $('#name').textContent = `${entity.grade.name} ${entity.bug.name}`;
  $('#enc').style.display = 'block';
}

function closeCatch() {
  game.activeCatch = null;
  $('#enc').style.display = 'none';
}

function cursorPos() {
  return (.5 + .5 * Math.sin((performance.now() - game.catchStart) * .001 * Math.PI * 2)) * 100;
}

function judge(p) {
  const d = Math.abs(p - 50);
  if (d < 7) return ['PERFECT', 30, 1.5];
  if (d < 16) return ['GREAT', 22, 1.25];
  if (d < 28) return ['GOOD', 15, 1.1];
  return ['MISS', 0, .8];
}

function tryCatch() {
  if (game.activeCatch === null) return;
  const entity = game.entities[game.activeCatch];
  const result = judge(cursorPos());
  const rate = Math.max(.1, Math.min(.95, entity.grade.rate + (result[1] ? .08 : -.1)));
  if (Math.random() < rate && result[1] > 0) {
    const gain = Math.round(entity.grade.pts * result[2]);
    game.points += gain;
    game.caught[entity.bug.name] = (game.caught[entity.bug.name] || 0) + 1;
    game.lastEvent = `${entity.grade.name} ${entity.bug.name}를 만났다. 호박사: “오, 그건 나도 좀 보고 싶은데?”`;
    game.entities.splice(game.activeCatch, 1);
    toast(`${result[0]}! 연구별 +${gain}`);
    closeCatch();
  } else {
    toast('놓쳤다. 그래도 흔적은 남았다.');
  }
}

function openModal(html) {
  $('#modalBody').innerHTML = html;
  $('#modal').style.display = 'block';
}

function openDex() {
  const html = '<h2>곤충 앨범</h2>' + BUGS.map(b => `<div class="dexitem">${bugImage(b)}<div><b>${b.name}</b><br>만난 수: ${game.caught[b.name] || 0}<br><small>호박사 메모: ${game.caught[b.name] ? '봤다. 귀엽다. 아마도.' : '아직 못 봤다. 나도 궁금하다.'}</small></div></div>`).join('');
  openModal(html);
}

function tick() {
  const input = game.input;
  input.vx *= .86;
  input.vy *= .86;
  if (Math.abs(input.vx) + Math.abs(input.vy) > .001) movePlayer(input.vy * 8, input.vx * 8);
  renderWorld();
  if (game.activeCatch !== null) {
    const p = cursorPos();
    const result = judge(p);
    $('#cur').style.left = `calc(${p}% - 3px)`;
    $('#judge').textContent = result[0];
  }
  requestAnimationFrame(tick);
}

function bind() {
  $('#start').onclick = startGame;
  $('#openDexTitle').onclick = () => { startGame(); openDex(); };
  $('#openDex').onclick = openDex;
  $('#diary').onclick = () => openModal(`<h2>오늘의 탐험일기</h2><p>${game.lastEvent}</p>`);
  $('#home').onclick = () => toast('호박사: 귀환석은 다음 버전에서 줄게. 지금은 걸어.');
  $('#closeModal').onclick = () => $('#modal').style.display = 'none';
  $('#close').onclick = closeCatch;
  $('#catch').onclick = tryCatch;

  const field = $('#game');
  field.addEventListener('pointerdown', e => {
    game.input.dragging = true;
    game.input.lx = e.clientX;
    game.input.ly = e.clientY;
  });
  field.addEventListener('pointermove', e => {
    if (!game.input.dragging) return;
    const dx = e.clientX - game.input.lx;
    const dy = e.clientY - game.input.ly;
    game.input.lx = e.clientX;
    game.input.ly = e.clientY;
    game.input.vx = Math.max(-1, Math.min(1, dx * .025));
    game.input.vy = Math.max(-1, Math.min(1, -dy * .025));
  });
  field.addEventListener('pointerup', () => game.input.dragging = false);
  field.addEventListener('pointercancel', () => game.input.dragging = false);
}

bind();
requestAnimationFrame(tick);
