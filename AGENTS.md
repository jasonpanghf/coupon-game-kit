# AGENTS.md

## Project Overview

This repository is a reusable lightweight coupon game kit for our existing web app products.  
The goal is to build simple mobile-first mini games that allow end users to win coupons or prizes.  
The games should be reusable across different campaigns, hotels, venues, membership programs, and travel-related web apps.

## Main Product Direction

Build a modular coupon game framework, not a one-off game.

Current target games:
1. Spin Wheel Coupon Game
2. Scratch Card Coupon Game
3. Mystery Box / Lucky Card Coupon Game

The first priority is Spin Wheel. Other games should reuse the same reward engine, campaign config, analytics events, and coupon claim flow.

## Technical Preferences

- Prefer TypeScript.
- Prefer a lightweight frontend implementation.
- Keep the code easy to embed into existing web apps.
- Avoid unnecessary heavy dependencies.
- Do not add new production dependencies without explaining why.
- Mobile-first UI is mandatory.
- The game must work well inside an iframe or embedded route.
- The architecture should allow future integration with backend coupon APIs.

## Development Rules

- Before coding, inspect the existing repo structure and summarize your plan.
- Keep changes focused and avoid unrelated refactoring.
- If an existing pattern exists, follow it.
- If no pattern exists, create a simple, clean, documented structure.
- All reward logic must be isolated from game UI logic.
- Do not hardcode prize probability inside UI components.
- Use campaign config to control rewards, probabilities, labels, colors, and limits.

## Security and Coupon Rules

For MVP, mock coupon issuance is acceptable.  
However, the code must clearly separate mock frontend reward logic from future secure backend coupon issuance.

Do not assume frontend-only coupon generation is secure for production.  
Design the interface so a backend can later:
- validate campaign eligibility
- prevent duplicate claims
- issue real coupon codes
- record reward history
- enforce campaign limits

## Required Commands

After implementation, run the relevant commands available in the repo, such as:

- npm install, if dependencies are missing
- npm run dev, if available
- npm run build
- npm run lint, if available
- npm run test, if available

If a command does not exist, report it instead of inventing it.

## Done Definition

A task is done only when:

- The requested feature works in mobile viewport.
- The game flow can be completed from start to reward result.
- Reward config can be changed without editing game UI code.
- The code builds successfully.
- The implementation has clear comments where future backend integration is expected.
- A short summary of changes, test result, and remaining risks is provided.

## Output Style

When you finish a task, provide:

1. Summary of what changed
2. Files changed
3. How to run locally
4. How to test manually
5. Known limitations or production risks
6. Recommended next task

