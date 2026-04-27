# QA Checklist

- [ ] Spin Wheel loads on mobile viewport.
- [ ] Tap Spin Now.
- [ ] Wheel animates and stops.
- [ ] Reward result appears.
- [ ] Coupon code appears when reward has a coupon.
- [ ] Copy Coupon works or shows browser fallback.
- [ ] CTA button opens the configured URL.
- [ ] Attempt limit disables repeated play.
- [ ] Refresh after playing shows previous reward result.
- [ ] Reset Demo allows local QA replay.
- [ ] Changing `rewardConfig.ts` changes labels, colors, probabilities, CTA, and terms without editing game UI.
- [ ] Invalid probability total shows a friendly error.
- [ ] iframe parent receives `coupon_game_event` messages.
- [ ] `npm run build` succeeds.
