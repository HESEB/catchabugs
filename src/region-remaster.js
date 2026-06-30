const REGION_THEMES = {
  forest: {
    match: ['숲'],
    title: '숲',
    subtitle: 'Forest Zone',
    bonus: '희귀 장수풍뎅이 신호 ↑',
    color: '#38d878',
    radar: '#38d878',
    objects: ['🌲','🌳','🌿','🪨','🌼','🍄'],
    line: '호박사: 숲은 희귀 곤충이 숨어들기 좋은 곳이야.'
  },
  field: {
    match: ['초원'],
    title: '초원',
    subtitle: 'Grass Field',
    bonus: '나비·귀뚜라미 신호 ↑',
    color: '#e7d85a',
    radar: '#ffe45c',
    objects: ['🌾','🌿','🌼','🌻','🪻','🦋'],
    line: '호박사: 풀잎 사이를 천천히 보면 작은 움직임이 보여.'
  },
  river: {
    match: ['강가'],
    title: '강가',
    subtitle: 'River Side',
    bonus: '잠자리·물방개 신호 ↑',
    color: '#58c9ff',
    radar: '#58c9ff',
    objects: ['🌊','💧','🪨','🌾','🪵','🐟'],
    line: '호박사: 물가에서는 잠자리의 직선 비행을 조심해.'
  },
  city: {
    match: ['도시'],
    title: '도시',
    subtitle: 'City Zone',
    bonus: '개미·귀뚜라미 신호 ↑',
    color: '#b6c0cc',
    radar: '#b6c0cc',
    objects: ['🏢','🏠','🛣️','🚦','🪑','💡'],
    line: '호박사: 도시에도 의외로 작은 생태계가 살아 있어.'
  }
};

let currentKey = '';
let layer;
let banner;
let lineBox;

function ensureLayer() {
  if (layer) return;
  const game = document.getElementById('game');
  layer = document.createElement('div');
  layer.id = 'regionLayer';
  game.appendChild(layer);

  banner = document.createElement('div');
  banner.id = 'regionBanner';
  game.appendChild(banner);

  lineBox = document.createElement('div');
  lineBox.id = 'regionLine';
  game.appendChild(lineBox);
}

function detectRegion() {
  const card = document.querySelector('.hud .card');
  const text = card ? card.textContent : '';
  return Object.entries(REGION_THEMES).find(([, theme]) => theme.match.some(word => text.includes(word)))?.[0] || 'forest';
}

function seededPosition(index, seed) {
  const x = Math.abs(Math.sin((index + 1) * 12.9898 + seed) * 43758.5453) % 1;
  const y = Math.abs(Math.sin((index + 1) * 78.233 + seed * 3) * 24634.6345) % 1;
  return [x * 118 - 9, y * 118 - 9];
}

function buildObjects(key) {
  const theme = REGION_THEMES[key];
  layer.innerHTML = '';
  const count = key === 'city' ? 34 : key === 'river' ? 38 : 46;
  for (let i = 0; i < count; i += 1) {
    const node = document.createElement('i');
    const [x, y] = seededPosition(i, key.length * 17);
    const item = theme.objects[i % theme.objects.length];
    node.textContent = item;
    node.style.left = `${x}%`;
    node.style.top = `${y}%`;
    node.style.animationDelay = `${(i % 7) * -0.37}s`;
    node.style.fontSize = `${18 + (i % 5) * 5}px`;
    node.className = `regionObj ${key}`;
    layer.appendChild(node);
  }
}

function showBanner(key) {
  const theme = REGION_THEMES[key];
  banner.innerHTML = `<b>${theme.title}</b><span>${theme.subtitle}</span><em>${theme.bonus}</em>`;
  banner.style.setProperty('--regionColor', theme.color);
  banner.classList.remove('show');
  void banner.offsetWidth;
  banner.classList.add('show');
  lineBox.textContent = theme.line;
  lineBox.classList.remove('show');
  void lineBox.offsetWidth;
  lineBox.classList.add('show');
}

function applyRadarTheme(key) {
  const theme = REGION_THEMES[key];
  const radar = document.getElementById('radar');
  if (!radar) return;
  radar.style.setProperty('--regionRadar', theme.radar);
  radar.dataset.region = key;
}

function tick() {
  ensureLayer();
  const key = detectRegion();
  if (key !== currentKey) {
    currentKey = key;
    document.body.dataset.region = key;
    buildObjects(key);
    showBanner(key);
    applyRadarTheme(key);
  }
  const map = document.getElementById('map');
  if (map && layer) layer.style.transform = map.style.transform || '';
  requestAnimationFrame(tick);
}

tick();
