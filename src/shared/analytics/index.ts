import { emitGameEvent, type CouponGameEventName, type EmbedContext } from '../../embed/postMessage';

export type AnalyticsPayload = {
  context: EmbedContext;
  gameType: string;
  rewardId?: string;
  data?: Record<string, unknown>;
};

export function trackEvent(eventName: CouponGameEventName, payload: AnalyticsPayload) {
  const event = {
    type: 'coupon_game_event' as const,
    eventName,
    campaignId: payload.context.campaignId,
    gameType: payload.gameType,
    userId: payload.context.userId,
    source: payload.context.source,
    locale: payload.context.locale,
    rewardId: payload.rewardId,
    timestamp: new Date().toISOString(),
    data: payload.data,
  };

  console.info('[coupon-game-kit]', event);
  emitGameEvent(event);
}
