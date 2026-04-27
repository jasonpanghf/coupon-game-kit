import React from 'react';
import { createRoot } from 'react-dom/client';
import { readEmbedContext } from '../embed/postMessage';
import { SpinWheelGame } from '../games/spin-wheel';
import { defaultCampaignConfig } from '../reward/rewardConfig';
import { trackEvent } from '../shared/analytics';
import '../styles/global.css';

const embedContext = readEmbedContext(defaultCampaignConfig.campaignId);
const campaignConfig = {
  ...defaultCampaignConfig,
  campaignId: embedContext.campaignId,
};

document.documentElement.lang = embedContext.locale;
trackEvent('game_viewed', {
  context: embedContext,
  gameType: campaignConfig.game.type,
});

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SpinWheelGame config={campaignConfig} embedContext={embedContext} />
  </React.StrictMode>,
);
