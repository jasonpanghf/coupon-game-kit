# Reward Engine Spec

The reward engine receives a campaign config and returns a selected reward using weighted probability.

Rules:
- UI components must not hardcode reward probability.
- Reward probability values must total 100.
- Rewards with zero probability are ignored.
- Rewards with a configured limit of zero are ignored.
- No-prize rewards are supported by setting `couponCode` to `null`.
- Frontend reward selection is acceptable for MVP demos only.
- Production coupon issuance must be validated by a backend.

Public functions:

- `validateRewardConfig(rewards)`
- `pickReward(config)`
