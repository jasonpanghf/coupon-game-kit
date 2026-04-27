# Coupon Game Kit

A lightweight TypeScript coupon game framework for reusable campaign mini games.

Current MVP:
- Spin Wheel coupon game
- Shared campaign reward config
- Isolated reward engine
- Mock coupon claim API
- Shared analytics and local storage helpers
- iframe embed and optional web component wrapper
- postMessage events for parent apps

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production files are generated in `dist/`. The Vite config uses a relative base path so the same build can be tested on GitHub Pages project URLs and other static hosts.

## Architecture

Game UI modules live in `src/games`. Reward selection and coupon claims live in `src/reward`, separate from UI code. Campaign settings, prizes, labels, colors, terms, and limits are controlled by `rewardConfig.ts` or compatible JSON config.

The current coupon claim flow is mocked for MVP. Production coupon issuance should be validated and recorded by a backend service.

## Embed Example

```text
/?campaignId=hotel-spring-2026&userId=user-123&source=booking-flow&locale=en-US&embedded=true
```

Open `examples/embed-example.html` through the Vite dev server to see parent `postMessage` events.
