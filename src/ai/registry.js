import { walk } from './behaviors/walk.js';
import { flutter } from './behaviors/flutter.js';
import { dart } from './behaviors/dart.js';
import { jump } from './behaviors/jump.js';
import { zigzag } from './behaviors/zigzag.js';
import { glow } from './behaviors/glow.js';

export const behaviorRegistry = Object.freeze({
  idle: walk,
  walk,
  flutter,
  dart,
  jump,
  zigzag,
  glow,
});

export function runBehavior(pattern, entity, ai, ctx = {}) {
  const handler = behaviorRegistry[pattern] || behaviorRegistry.walk;
  return handler(entity, ai, ctx);
}
