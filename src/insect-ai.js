// CATCHA BUGS - Insect AI module
// AI movement logic lives here so the main radar loop only coordinates rendering and input.

import { runBehavior } from './ai/registry.js';
import { applyPersonalityContext, pickPersonality } from './ai/personality.js';
import { applyRarityContext } from './ai/rarity.js';
import { applySpeciesContext, getSpeciesProfile } from './ai/species.js';

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
    personality: pickPersonality(seed),
    phase: seed * Math.PI * 2,
    timer: 0,
    vx: 0,
    vy: 0,
    alert: 0,
  };
}

export function getDefaultPattern(bug = {}) {
  const key = `${bug.id || ''} ${bug.name || ''} ${bug.habitat || ''} ${bug.behavior || ''}`.toLowerCase();

  if (key.includes('flutter') || key.includes('butterfly') || key.includes('나비')) return AI_PATTERNS.FLUTTER;
  if (key.includes('dart') || key.includes('dragonfly') || key.includes('잠자리')) return AI_PATTERNS.DART;
  if (key.includes('ant') || key.includes('개미')) return AI_PATTERNS.ZIGZAG;
  if (key.includes('jump') || key.includes('cricket') || key.includes('grasshopper') || key.includes('귀뚜라미') || key.includes('메뚜기')) return AI_PATTERNS.JUMP;
  if (key.includes('firefly') || key.includes('반딧불')) return AI_PATTERNS.GLOW;
  if (key.includes('beetle') || key.includes('stag') || key.includes('풍뎅이') || key.includes('사슴벌레')) return AI_PATTERNS.WALK;

  return AI_PATTERNS.WALK;
}

export function ensureAIState(entity) {
  if (!entity.ai) {
    entity.ai = createAIState(Math.random());
  }

  const species = getSpeciesProfile(entity);

  if (species.personality) {
    entity.ai.personality = species.personality;
  } else if (!entity.ai.personality) {
    entity.ai.personality = pickPersonality(entity.ai.seed || Math.random());
  }

  if (species.pattern) {
    entity.ai.pattern = species.pattern;
  } else if (!entity.ai.pattern || entity.ai.pattern === AI_PATTERNS.IDLE) {
    entity.ai.pattern = getDefaultPattern(entity.bug || entity);
  }

  return entity.ai;
}

function playerDelta(entity, player) {
  return {
    x: entity.wx - (player?.x || 0),
    y: entity.wy - (player?.y || 0),
  };
}

function resolvePattern(entity, ai, species) {
  if (species?.pattern) return species.pattern;
  const behavior = entity.bug?.behavior;
  if (behavior && behavior !== 'idle') return behavior;
  return ai.pattern || AI_PATTERNS.WALK;
}

function multiplyProfileValue(ctx, key) {
  return (ctx.personality?.[key] || 1) * (ctx.rarity?.[key] || 1) * (ctx.species?.[key] || 1);
}

function runBehaviorWithContextSpeed(pattern, entity, ai, ctx) {
  const originalSpeed = entity.grade?.speed;
  const speedBoost = multiplyProfileValue(ctx, 'speed');

  if (entity.grade && Number.isFinite(originalSpeed)) {
    entity.grade.speed = originalSpeed * speedBoost;
  }

  runBehavior(pattern, entity, ai, ctx);

  if (entity.grade && Number.isFinite(originalSpeed)) {
    entity.grade.speed = originalSpeed;
  }
}

export function updateInsectAI(entity, context = {}) {
  const ai = ensureAIState(entity);
  const player = context.player || { x: 0, y: 0 };
  const toast = typeof context.toast === 'function' ? context.toast : null;
  const random = typeof context.random === 'function' ? context.random : Math.random;
  const personalityContext = applyPersonalityContext(ai, context);
  const rarityContext = applyRarityContext(entity, personalityContext);
  const speciesContext = applySpeciesContext(entity, rarityContext);

  entity.drift = Number.isFinite(entity.drift) ? entity.drift : ai.phase;
  entity.drift += 0.012 * multiplyProfileValue(speciesContext, 'drift');
  ai.timer += context.dt || 1;

  const p = playerDelta(entity, player);
  const d = Math.hypot(p.x, p.y);
  const pattern = resolvePattern(entity, ai, speciesContext.species);

  runBehaviorWithContextSpeed(pattern, entity, ai, {
    ...speciesContext,
    player,
    random,
    distanceToPlayer: d,
    deltaToPlayer: p,
  });

  const signalRange = 130 * multiplyProfileValue(speciesContext, 'signalRange');
  const signalRate = 0.006 * multiplyProfileValue(speciesContext, 'signalChance');

  if (!entity.signal && d < signalRange && random() < signalRate) {
    entity.signal = true;
  }

  const shyFleeRate = 0.012 * multiplyProfileValue(speciesContext, 'fleeChance');
  const fleeDistance = 40 * multiplyProfileValue(speciesContext, 'fleeDistance');

  if (d < 80 && entity.mood === 'shy' && random() < shyFleeRate) {
    const away = Math.atan2(p.y, p.x);
    entity.wx += Math.cos(away) * fleeDistance;
    entity.wy += Math.sin(away) * fleeDistance;
    entity.signal = true;
    if (toast) toast('깜짝! 생태 신호가 이동했다.');
  }

  return entity;
}
