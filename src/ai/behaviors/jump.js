export function jump(entity, ai, ctx = {}) {
  const random = typeof ctx.random === 'function' ? ctx.random : Math.random;
  if (random() < 0.012) {
    entity.wx += (random() * 2 - 1) * 14;
    entity.wy += (random() * 2 - 1) * 14;
  }
  return entity;
}
