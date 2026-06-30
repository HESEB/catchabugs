export const PERSONALITY_PROFILES = Object.freeze({
  calm: {
    label: '느긋함',
    speed: 0.92,
    drift: 0.9,
    jumpChance: 0.8,
    jumpDistance: 0.85,
    fleeChance: 0.75,
    fleeDistance: 0.8,
    signalChance: 0.8,
  },
  curious: {
    label: '호기심',
    speed: 1.02,
    drift: 1.05,
    jumpChance: 1.0,
    jumpDistance: 0.9,
    fleeChance: 0.65,
    fleeDistance: 0.7,
    signalChance: 1.15,
  },
  timid: {
    label: '겁많음',
    speed: 1.08,
    drift: 1.1,
    jumpChance: 1.25,
    jumpDistance: 1.2,
    fleeChance: 1.55,
    fleeDistance: 1.25,
    signalChance: 1.25,
  },
  active: {
    label: '활발함',
    speed: 1.18,
    drift: 1.25,
    jumpChance: 1.35,
    jumpDistance: 1.1,
    fleeChance: 1.0,
    fleeDistance: 1.0,
    signalChance: 1.0,
  },
  bold: {
    label: '대담함',
    speed: 1.0,
    drift: 1.0,
    jumpChance: 0.9,
    jumpDistance: 1.0,
    fleeChance: 0.35,
    fleeDistance: 0.65,
    signalChance: 0.75,
  },
});

const PERSONALITY_KEYS = Object.freeze(Object.keys(PERSONALITY_PROFILES));

export function pickPersonality(seed = Math.random()) {
  const index = Math.abs(Math.floor(seed * 9973)) % PERSONALITY_KEYS.length;
  return PERSONALITY_KEYS[index];
}

export function getPersonalityProfile(personality = 'calm') {
  return PERSONALITY_PROFILES[personality] || PERSONALITY_PROFILES.calm;
}

export function applyPersonalityContext(ai, ctx = {}) {
  const profile = getPersonalityProfile(ai?.personality);
  return {
    ...ctx,
    personality: profile,
    personalityName: ai?.personality || 'calm',
  };
}
