# Integration Guide

Coupon Game Kit can run standalone, inside an iframe, or through the optional web component wrapper.

## Standalone Or Direct Route

Use the app route directly:

```text
/?campaignId=hotel-spring-2026&userId=user-123&source=booking-flow&locale=en-US
```

Supported query parameters:

- `campaignId`: campaign identifier used by config, analytics, storage, and reward events.
- `userId`: current user/member/session identifier. For MVP this is used by the mock claim flow and local attempt key.
- `source`: parent app or placement, such as `booking-flow`, `member-portal`, or `hotel-site`.
- `locale`: BCP 47 locale string, such as `en-US`, `zh-HK`, or `ja-JP`.
- `embedded`: set to `true` when the route is running inside an iframe or web component.

## iframe Embed

```html
<iframe
  title="Coupon game"
  src="/?campaignId=hotel-spring-2026&userId=user-123&source=iframe-demo&locale=en-US&embedded=true"
></iframe>
```

Parent pages can listen for events:

```js
window.addEventListener('message', (event) => {
  const message = event.data;

  if (!message || message.type !== 'coupon_game_event') {
    return;
  }

  if (message.eventName === 'game_completed') {
    console.log('Game completed', message.data?.result);
  }

  if (message.eventName === 'reward_claimed') {
    console.log('Reward claimed', message.data?.claim);
  }

  if (message.eventName === 'close_game' || message.eventName === 'game_closed') {
    console.log('Close requested');
  }
});
```

## postMessage Events

The game emits events to `window.parent` when embedded. The event envelope is:

```js
{
  type: 'coupon_game_event',
  eventName: 'reward_claimed',
  campaignId: 'hotel-spring-2026',
  gameType: 'spin-wheel',
  userId: 'user-123',
  source: 'iframe-demo',
  locale: 'en-US',
  rewardId: 'reward_10_off',
  timestamp: '2026-04-27T00:00:00.000Z',
  data: {}
}
```

Supported `eventName` values:

- `game_viewed`
- `game_started`
- `spin_started`
- `spin_completed`
- `game_completed`
- `reward_revealed`
- `coupon_copied`
- `reward_claimed`
- `cta_clicked`
- `game_closed`
- `close_game`

Reward-related events include selected reward and claim details inside `data`.

## Campaign Config

Campaign config controls visible text, theme, reward list, probability, CTA label, CTA URL, terms, legal links, and game settings. See `examples/campaign-config.sample.json`.

Probability values must total 100. Invalid config shows a user-friendly error and logs developer details.

## Replacing The Mock Coupon API

The MVP mock API lives in `src/reward/couponApi.ts`.

For production, replace `claimReward()` with a backend request that:

- validates campaign eligibility
- prevents duplicate claims
- issues real coupon codes
- records reward history
- enforces campaign limits
- returns a secure coupon result

## Web Component

```html
<coupon-game
  campaign-id="hotel-spring-2026"
  user-id="user-123"
  source="web-component-demo"
  locale="en-US"
></coupon-game>
<script type="module" src="/src/embed/web-component.ts"></script>
```

The web component currently wraps the iframe URL and passes attributes through as query parameters.
