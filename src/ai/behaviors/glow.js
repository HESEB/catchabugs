export function glow(entity, ai, ctx = {}) {
  const speed = entity.grade?.speed || 1;
  entity.wx += Math.sin(entity.drift * 0.9) * 0.04 * speed;
  entity.wy += Math.cos(entity.drift * 0.8) * 0.04 * speed;
  entity.glow = 0.45 + Math.sin(entity.drift * 3.5) * 0.35;
  entity.signal = true;
  return entity;
}
