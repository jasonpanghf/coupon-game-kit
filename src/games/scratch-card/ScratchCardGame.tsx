import React, { useMemo, useState, type CSSProperties } from 'react';
import type { EmbedContext } from '../../embed/postMessage';
import { claimReward, type ClaimRewardResponse } from '../../reward/couponApi';
import { pickReward, type RewardResult, validateRewardConfig } from '../../reward/rewardEngine';
import type { CampaignConfig } from '../../reward/rewardConfig';
import { trackEvent } from '../../shared/analytics';
import { getStoredValue, setStoredValue } from '../../shared/storage';

type ScratchCardGameProps = {
  config: CampaignConfig;
  embedContext: EmbedContext;
};

type GameState = 'ready' | 'scratching' | 'complete';
type StoredReward = {
  result: RewardResult;
  claim: ClaimRewardResponse;
};

export function ScratchCardGame({ config, embedContext }: ScratchCardGameProps) {
  const gameType = config.game.type;
  const attemptedKey = `${config.campaignId}:${gameType}:${embedContext.userId || 'anonymous'}:attempted`;
  const resultKey = `${config.campaignId}:${gameType}:${embedContext.userId || 'anonymous'}:result`;
  const storedReward = getStoredValue<StoredReward | null>(resultKey, null);
  const storedAttempted = getStoredValue(attemptedKey, false);
  const validation = useMemo(() => validateRewardConfig(config.rewards), [config.rewards]);
  const [alreadyAttempted, setAlreadyAttempted] = useState(storedAttempted);
  const [state, setState] = useState<GameState>(storedAttempted ? 'complete' : 'ready');
  const [scratchProgress, setScratchProgress] = useState(storedAttempted ? 100 : 0);
  const [result, setResult] = useState<RewardResult | null>(storedReward?.result ?? null);
  const [claim, setClaim] = useState<ClaimRewardResponse | null>(storedReward?.claim ?? null);
  const [copyLabel, setCopyLabel] = useState('Copy Coupon');
  const canPlay = validation.valid && state !== 'scratching' && !alreadyAttempted;
  const isDevelopmentMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  async function revealReward() {
    if (!canPlay) {
      return;
    }

    setState('scratching');
    setClaim(null);
    trackEvent('game_started', { context: embedContext, gameType });

    const selected = pickReward(config);
    setStoredValue(attemptedKey, true);
    setAlreadyAttempted(true);

    window.setTimeout(async () => {
      setScratchProgress(100);
      setResult(selected);
      trackEvent('game_completed', {
        context: embedContext,
        gameType,
        rewardId: selected.reward.id,
        data: { result: selected },
      });
      trackEvent('reward_revealed', {
        context: embedContext,
        gameType,
        rewardId: selected.reward.id,
        data: { hasCoupon: Boolean(selected.reward.couponCode), result: selected },
      });

      const claimResult = await claimSelectedReward(selected);
      setClaim(claimResult);
      setStoredValue<StoredReward>(resultKey, { result: selected, claim: claimResult });
      trackEvent('reward_claimed', {
        context: embedContext,
        gameType,
        rewardId: selected.reward.id,
        data: { result: selected, claim: claimResult },
      });
      setState('complete');
    }, 900);
  }

  async function claimSelectedReward(selected: RewardResult) {
    try {
      return await claimReward({
        campaignId: selected.campaignId,
        userId: embedContext.userId,
        rewardId: selected.reward.id,
        couponCode: selected.reward.couponCode,
        source: embedContext.source,
      });
    } catch {
      return {
        claimId: `failed:${selected.campaignId}:${selected.reward.id}`,
        success: false,
        couponCode: null,
        message: 'We could not claim this reward right now. Please try again later.',
      };
    }
  }

  function handleScratchMove() {
    if (!canPlay && state !== 'scratching') {
      return;
    }

    setScratchProgress((current) => {
      const next = Math.min(100, current + 18);
      if (next >= 60 && canPlay) {
        revealReward();
      }
      return next;
    });
  }

  function handleResetDemo() {
    setStoredValue(attemptedKey, false);
    setStoredValue(resultKey, null);
    setAlreadyAttempted(false);
    setState('ready');
    setScratchProgress(0);
    setResult(null);
    setClaim(null);
  }

  async function handleCopyCoupon() {
    if (!claim?.couponCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(claim.couponCode);
      setCopyLabel('Copied');
    } catch {
      window.prompt('Copy this coupon code:', claim.couponCode);
      setCopyLabel('Ready');
    }

    trackEvent('coupon_copied', {
      context: embedContext,
      gameType,
      rewardId: result?.reward.id,
      data: { couponCode: claim.couponCode },
    });
    window.setTimeout(() => setCopyLabel('Copy Coupon'), 1400);
  }

  function handleCtaClick() {
    if (!result?.reward.ctaUrl) {
      return;
    }

    trackEvent('cta_clicked', {
      context: embedContext,
      gameType,
      rewardId: result.reward.id,
      data: { ctaLabel: result.reward.ctaLabel, ctaUrl: result.reward.ctaUrl },
    });
    window.open(result.reward.ctaUrl, '_blank', 'noopener,noreferrer');
  }

  function handleCloseGame() {
    trackEvent('game_closed', {
      context: embedContext,
      gameType,
      rewardId: result?.reward.id,
      data: { reason: 'user_clicked_close' },
    });
    trackEvent('close_game', {
      context: embedContext,
      gameType,
      rewardId: result?.reward.id,
      data: { reason: 'user_clicked_close' },
    });
  }

  return (
    <div
      className="spin-game"
      style={
        {
          '--brand': config.theme.primaryColor,
          '--accent': config.theme.buttonColor,
          '--surface': config.theme.backgroundColor,
          '--text': '#102027',
          '--button-text': config.theme.buttonTextColor,
        } as CSSProperties
      }
    >
      <header className="game-header">
        <p className="eyebrow">{config.brandName}</p>
        <h1>Scratch to Win</h1>
        <p>{config.subtitle}</p>
      </header>

      {!validation.valid ? (
        <section className="error-panel" role="alert">
          <p className="eyebrow">Config Error</p>
          <h2>This campaign is not available right now.</h2>
          <p>Please check reward probability and campaign settings.</p>
        </section>
      ) : null}

      <main className="game-stage single-game" aria-live="polite" hidden={!validation.valid}>
        <button
          className={`scratch-card ${result ? 'is-revealed' : ''}`}
          type="button"
          disabled={!canPlay && state !== 'scratching'}
          onClick={revealReward}
          onPointerMove={handleScratchMove}
          aria-label="Scratch card to reveal reward"
        >
          <span className="scratch-prize">{result?.reward.label || 'Hidden Prize'}</span>
          <span className="scratch-cover" style={{ opacity: Math.max(0, 1 - scratchProgress / 100) }}>
            {state === 'scratching' ? 'Scratching...' : alreadyAttempted ? 'Already Played' : 'Scratch Here'}
          </span>
        </button>

        <section className="result-panel" role={result ? 'dialog' : undefined} aria-modal={result ? 'true' : undefined}>
          {result ? (
            <>
              <p className="eyebrow">{alreadyAttempted ? 'Already Played' : 'Your Reward'}</p>
              <h2>{result.reward.label}</h2>
              <p>{result.reward.description}</p>
              {claim?.couponCode ? (
                <div className="coupon-row">
                  <strong className="coupon-code">{claim.couponCode}</strong>
                  <button className="secondary-button" type="button" onClick={handleCopyCoupon}>
                    {copyLabel}
                  </button>
                </div>
              ) : null}
              {result.reward.ctaUrl ? (
                <button className="primary-button inline-action" type="button" onClick={handleCtaClick}>
                  {result.reward.ctaLabel || 'View Offer'}
                </button>
              ) : null}
              {result.reward.terms ? <small>{result.reward.terms}</small> : null}
              {claim && !claim.success ? <p className="claim-error">{claim.message}</p> : null}
            </>
          ) : (
            <>
              <p className="eyebrow">Ready</p>
              <h2>Reveal your travel perk</h2>
              <p>Tap or swipe across the card to reveal one configured reward.</p>
            </>
          )}
        </section>
      </main>

      <footer className="action-bar">
        <button className="primary-button" disabled={!canPlay} type="button" onClick={revealReward}>
          {state === 'scratching' ? 'Revealing...' : alreadyAttempted ? 'Already Played' : 'Reveal Card'}
        </button>
        {isDevelopmentMode ? (
          <button className="text-button" type="button" onClick={handleResetDemo}>
            Reset Demo
          </button>
        ) : null}
        {embedContext.embedded ? (
          <button className="text-button" type="button" onClick={handleCloseGame}>
            Close
          </button>
        ) : null}
      </footer>
    </div>
  );
}

