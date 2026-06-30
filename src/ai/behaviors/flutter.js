export function flutter(entity, ai, ctx = {}) {
  const speed = entity.grade?.speed || 1;
  entity.wx += Math.sin(entity.drift * 1.8) * 0.18 * speed;
  entity.wy += Math.cos(entity.drift * 1.1) * 0.14 * speed;
  return entity;
}
