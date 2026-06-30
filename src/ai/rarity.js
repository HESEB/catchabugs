export const RARITY_PROFILES = Object.freeze({
  common: {
    label: '일반',
    minPts: 0,
    speed: 0.95,
    drift: 0.95,
    fleeChance: 0.75,
    fleeDistance: 0.85,
    signalRange: 0.8,
    signalChance: 0.7,
  },
  uncommon: {
    label: '비범',
    minPts: 24,
    speed: 1,
    drift: 1,
    fleeChance: 0.9,
    fleeDistance: 0.95,
    signalRange: 1,
    signalChance: 1,
  },
  rare: {
    label: '희귀',
    minPts: 42,
    speed: 1.08,
    drift: 1.08,
    fleeChance: 1.15,
    fleeDistance: 1.1,
    signalRange: 1.15,
    signalChance: 1.2,
  },
  epic: {
    label: '영웅',
    minPts: 76,
    speed: 1.16,
    drift: 1.16,
    fleeChance: 1.35,
    fleeDistance: 1.25,
    signalRange: 1.3,
    signalChance: 1.45,
  },
  legendary: {
    label: '전설',
    minPts: 110,
    speed: 1.26,
    drift: 1.24,
    fleeChance: 1.65,
    fleeDistance: 1.45,
    signalRange: 1.55,
    signalChance: 1.75,
  },
});

const RARITY_ORDER = Object.freeze(['common', 'uncommon', 'rare', 'epic', 'legendary']);

export function getRarityKey(grade = {}) {
  const pts = Number(grade.pts || 0);
  let selected = 'common';
  for (const key of RARITY_ORDER) {
    if (pts >= RARITY_PROFILES[key].minPts) selected = key;
  }
  return selected;
}

export function getRarityProfile(grade = {}) {
  return RARITY_PROFILES[getRarityKey(grade)] || RARITY_PROFILES.common;
}

export function applyRarityContext(entity, ctx = {}) {
  const rarity = getRarityProfile(entity?.grade);
  return {
    ...ctx,
    rarity,
    rarityName: getRarityKey(entity?.grade),
  };
}
