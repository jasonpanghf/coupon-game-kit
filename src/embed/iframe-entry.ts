import { readEmbedContext } from './postMessage';
import { defaultCampaignConfig } from '../reward/rewardConfig';
import { trackEvent } from '../shared/analytics';

trackEvent('game_viewed', {
  context: readEmbedContext(defaultCampaignConfig.campaignId),
  gameType: defaultCampaignConfig.game.type,
});
