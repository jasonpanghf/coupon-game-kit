export const routes = [
  { path: '/?gameType=spin-wheel', gameType: 'spin-wheel' },
  { path: '/?gameType=scratch-card', gameType: 'scratch-card' },
  { path: '/?gameType=mystery-box', gameType: 'mystery-box' },
] as const;
