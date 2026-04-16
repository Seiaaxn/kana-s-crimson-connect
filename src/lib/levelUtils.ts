// Level badge emojis and EXP calculations

export const LEVEL_BADGES: { maxLevel: number; emoji: string; name: string }[] = [
  { maxLevel: 5, emoji: '🌱', name: 'Sprout' },
  { maxLevel: 10, emoji: '🌿', name: 'Herb' },
  { maxLevel: 15, emoji: '🍀', name: 'Clover' },
  { maxLevel: 20, emoji: '🍃', name: 'Leaf' },
  { maxLevel: 30, emoji: '🌳', name: 'Tree' },
  { maxLevel: 40, emoji: '🌸', name: 'Blossom' },
  { maxLevel: 50, emoji: '🌺', name: 'Hibiscus' },
  { maxLevel: 75, emoji: '🔥', name: 'Fire' },
  { maxLevel: 100, emoji: '⚡', name: 'Lightning' },
  { maxLevel: 150, emoji: '💎', name: 'Diamond' },
  { maxLevel: 200, emoji: '👑', name: 'Crown' },
  { maxLevel: 300, emoji: '🏆', name: 'Trophy' },
  { maxLevel: 500, emoji: '🌟', name: 'Star' },
  { maxLevel: 1000, emoji: '💫', name: 'Cosmic' },
  { maxLevel: 5000, emoji: '🐉', name: 'Dragon' },
  { maxLevel: 10000, emoji: '🔱', name: 'Trident' },
  { maxLevel: 50000, emoji: '☀️', name: 'Sun' },
  { maxLevel: 100000, emoji: '🌌', name: 'Galaxy' },
  { maxLevel: 500000, emoji: '🪐', name: 'Planet' },
  { maxLevel: 9999999, emoji: '✨', name: 'Infinity' },
];

export function getLevelBadge(level: number) {
  const badge = LEVEL_BADGES.find(b => level <= b.maxLevel) || LEVEL_BADGES[LEVEL_BADGES.length - 1];
  return badge;
}

// EXP required for a specific level (to go from level N to N+1)
export function expForLevel(level: number): number {
  return Math.floor(Math.pow(level, 1.8) * 100);
}

// Total EXP accumulated to reach a level
export function totalExpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += expForLevel(i);
  }
  return total;
}

// Get current progress within current level
export function getExpProgress(totalExp: number, level: number) {
  const expAtCurrentLevel = totalExpForLevel(level);
  const expInCurrentLevel = totalExp - expAtCurrentLevel;
  const expNeeded = expForLevel(level);
  return {
    current: Math.max(0, expInCurrentLevel),
    needed: expNeeded,
    percentage: Math.min(100, (Math.max(0, expInCurrentLevel) / expNeeded) * 100),
  };
}
