export function walk(entity, ai, ctx = {}) {
  const speed = entity.grade?.speed || 1;
  entity.wx += Math.sin(entity.drift) * 0.06 * speed;
  entity.wy += Math.cos(entity.drift * 0.7) * 0.05 * speed;
  return entity;
}
