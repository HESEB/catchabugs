export function zigzag(entity, ai, ctx = {}) {
  const speed = entity.grade?.speed || 1;
  const wobble = Math.sign(Math.sin(entity.drift * 3.2) || 1);
  entity.wx += Math.sin(entity.drift * 1.25) * 0.12 * speed;
  entity.wy += wobble * 0.08 * speed;
  return entity;
}
