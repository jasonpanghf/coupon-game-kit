import React from 'react';
import { createRoot } from 'react-dom/client';
import { readEmbedContext } from '../embed/postMessage';
import { MysteryBoxGame } from '../games/mystery-box';
import { ScratchCardGame } from '../games/scratch-card';
import { SpinWheelGame } from '../games/spin-wheel';
import { defaultCampaignConfig } from '../reward/rewardConfig';
import { trackEvent } from '../shared/analytics';
import '../styles/global.css';

const embedContext = readEmbedContext(defaultCampaignConfig.campaignId);
const campaignConfig = {
  ...defaultCampaignConfig,
  campaignId: embedContext.campaignId,
  game: {
    ...defaultCampaignConfig.game,
    type: embedContext.gameType || defaultCampaignConfig.game.type,
  },
};

document.documentElement.lang = embedContext.locale;
trackEvent('game_viewed', {
  context: embedContext,
  gameType: campaignConfig.game.type,
});

function GameApp() {
  if (campaignConfig.game.type === 'scratch-card') {
    return <ScratchCardGame config={campaignConfig} embedContext={embedContext} />;
  }

  if (campaignConfig.game.type === 'mystery-box') {
    return <MysteryBoxGame config={campaignConfig} embedContext={embedContext} />;
  }

  return <SpinWheelGame config={campaignConfig} embedContext={embedContext} />;
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameApp />
  </React.StrictMode>,
);
