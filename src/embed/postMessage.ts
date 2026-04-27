export type EmbedContext = {
  campaignId: string;
  userId: string;
  source: string;
  locale: string;
  embedded: boolean;
};

export type CouponGameEventName =
  | 'game_viewed'
  | 'game_started'
  | 'game_completed'
  | 'spin_started'
  | 'spin_completed'
  | 'reward_revealed'
  | 'coupon_copied'
  | 'reward_claimed'
  | 'cta_clicked'
  | 'game_closed'
  | 'close_game';

export type CouponGameEventPayload = {
  type: 'coupon_game_event';
  eventName: CouponGameEventName;
  campaignId: string;
  gameType: string;
  userId?: string;
  source?: string;
  locale?: string;
  rewardId?: string;
  timestamp: string;
  data?: Record<string, unknown>;
};

export function emitGameEvent(event: CouponGameEventPayload) {
  window.dispatchEvent(new CustomEvent(event.eventName, { detail: event }));

  if (window.parent && window.parent !== window) {
    window.parent.postMessage(event, '*');
  }
}

export function readEmbedContext(defaultCampaignId: string): EmbedContext {
  const params = new URLSearchParams(window.location.search);

  return {
    campaignId: params.get('campaignId') || defaultCampaignId,
    userId: params.get('userId') || 'anonymous-demo-user',
    source: params.get('source') || 'standalone',
    locale: params.get('locale') || navigator.language || 'en',
    embedded: params.get('embedded') === 'true',
  };
}
