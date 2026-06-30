export function jump(entity, ai, ctx = {}) {
  const random = typeof ctx.random === 'function' ? ctx.random : Math.random;
  const personality = ctx.personality || {};
  const triggerRate = 0.012 * (personality.jumpChance || 1);
  const hopRange = 14 * (personality.jumpDistance || 1);

  if (random() < triggerRate) {
    entity.wx += (random() * 2 - 1) * hopRange;
    entity.wy += (random() * 2 - 1) * hopRange;
  }
  return entity;
}
