export function dart(entity, ai, ctx = {}) {
  const personality = ctx.personality || {};
  const speed = (entity.grade?.speed || 1) * (personality.speed || 1);
  entity.wx += Math.sin(entity.drift * 2.7) * 0.25 * speed;
  entity.wy += Math.cos(entity.drift * 2.1) * 0.2 * speed;
  return entity;
}
