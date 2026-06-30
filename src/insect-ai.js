// CATCHA BUGS - Insect AI module
// Commit 1: module scaffold only.
// This file is intentionally not wired into the game loop yet.
// The next refactor will move the current AI/update logic from main-radar.js here.

export const AI_PERSONALITIES = Object.freeze({
  CALM: 'calm',
  CURIOUS: 'curious',
  TIMID: 'timid',
  ACTIVE: 'active',
  BOLD: 'bold',
});

export const AI_PATTERNS = Object.freeze({
  IDLE: 'idle',
  WALK: 'walk',
  FLUTTER: 'flutter',
  DART: 'dart',
  JUMP: 'jump',
  ZIGZAG: 'zigzag',
  GLOW: 'glow',
});

export function createAIState(seed = Math.random()) {
  return {
    seed,
    pattern: AI_PATTERNS.IDLE,
    personality: AI_PERSONALITIES.CALM,
    phase: seed * Math.PI * 2,
    timer: 0,
    vx: 0,
    vy: 0,
    alert: 0,
  };
}

export function getDefaultPattern(bug = {}) {
  const key = `${bug.id || ''} ${bug.name || ''} ${bug.habitat || ''}`.toLowerCase();

  if (key.includes('butterfly') || key.includes('나비')) return AI_PATTERNS.FLUTTER;
  if (key.includes('dragonfly') || key.includes('잠자리')) return AI_PATTERNS.DART;
  if (key.includes('ant') || key.includes('개미')) return AI_PATTERNS.ZIGZAG;
  if (key.includes('cricket') || key.includes('grasshopper') || key.includes('귀뚜라미') || key.includes('메뚜기')) return AI_PATTERNS.JUMP;
  if (key.includes('firefly') || key.includes('반딧불')) return AI_PATTERNS.GLOW;
  if (key.includes('beetle') || key.includes('stag') || key.includes('풍뎅이') || key.includes('사슴벌레')) return AI_PATTERNS.WALK;

  return AI_PATTERNS.WALK;
}

export function ensureAIState(entity) {
  if (!entity.ai) {
    entity.ai = createAIState(Math.random());
  }
  if (!entity.ai.pattern) {
    entity.ai.pattern = getDefaultPattern(entity.bug || entity);
  }
  return entity.ai;
}

// Placeholder update function for the next commit.
// It currently preserves existing behavior by making no movement changes.
export function updateInsectAI(entity, context = {}) {
  const ai = ensureAIState(entity);
  ai.timer += context.dt || 1;
  return entity;
}
