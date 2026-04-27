import React, { useMemo, useState, type CSSProperties } from 'react';
import type { EmbedContext } from '../../embed/postMessage';
import { claimReward, type ClaimRewardResponse } from '../../reward/couponApi';
import { pickReward, type RewardResult, validateRewardConfig } from '../../reward/rewardEngine';
import type { CampaignConfig } from '../../reward/rewardConfig';
import { trackEvent } from '../../shared/analytics';
import { getStoredValue, setStoredValue } from '../../shared/storage';

type MysteryBoxGameProps = {
  config: CampaignConfig;
  embedContext: EmbedContext;
};

type GameState = 'ready' | 'opening' | 'complete';
type StoredReward = {
  result: RewardResult;
  claim: ClaimRewardResponse;
  boxIndex: number;
};

export function MysteryBoxGame({ config, embedContext }: MysteryBoxGameProps) {
  const gameType = config.game.type;
  const attemptedKey = `${config.campaignId}:${gameType}:${embedContext.userId || 'anonymous'}:attempted`;
  const resultKey = `${config.campaignId}:${gameType}:${embedContext.userId || 'anonymous'}:result`;
  const storedReward = getStoredValue<StoredReward | null>(resultKey, null);
  const storedAttempted = getStoredValue(attemptedKey, false);
  const validation = useMemo(() => validateRewardConfig(config.rewards), [config.rewards]);
  const [alreadyAttempted, setAlreadyAttempted] = useState(storedAttempted);
  const [state, setState] = useState<GameState>(storedAttempted ? 'complete' : 'ready');
  const [selectedBox, setSelectedBox] = useState<number | null>(storedReward?.boxIndex ?? null);
  const [result, setResult] = useState<RewardResult | null>(storedReward?.result ?? null);
  const [claim, setClaim] = useState<ClaimRewardResponse | null>(storedReward?.claim ?? null);
  const [copyLabel, setCopyLabel] = useState('Copy Coupon');
  const canPlay = validation.valid && state !== 'opening' && !alreadyAttempted;
  const isDevelopmentMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  async function openBox(boxIndex: number) {
    if (!canPlay) {
      return;
    }

    setState('opening');
    setSelectedBox(boxIndex);
    setClaim(null);
    trackEvent('game_started', { context: embedContext, gameType });

    const selected = pickReward(config);
    setStoredValue(attemptedKey, true);
    setAlreadyAttempted(true);

    window.setTimeout(async () => {
      setResult(selected);
      trackEvent('game_completed', {
        context: embedContext,
        gameType,
        rewardId: selected.reward.id,
        data: { result: selected, boxIndex },
      });
      trackEvent('reward_revealed', {
        context: embedContext,
        gameType,
        rewardId: selected.reward.id,
        data: { hasCoupon: Boolean(selected.reward.couponCode), result: selected, boxIndex },
      });

      const claimResult = await claimSelectedReward(selected);
      setClaim(claimResult);
      setStoredValue<StoredReward>(resultKey, { result: selected, claim: claimResult, boxIndex });
      trackEvent('reward_claimed', {
        context: embedContext,
        gameType,
        rewardId: selected.reward.id,
        data: { result: selected, claim: claimResult, boxIndex },
      });
      setState('complete');
    }, 850);
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

  function handleResetDemo() {
    setStoredValue(attemptedKey, false);
    setStoredValue(resultKey, null);
    setAlreadyAttempted(false);
    setState('ready');
    setSelectedBox(null);
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
        <h1>Pick a Mystery Box</h1>
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
        <section className="box-grid" aria-label="Mystery boxes">
          {[0, 1, 2].map((boxIndex) => (
            <button
              className={`mystery-box ${selectedBox === boxIndex ? 'is-selected' : ''}`}
              key={boxIndex}
              type="button"
              disabled={!canPlay}
              onClick={() => openBox(boxIndex)}
            >
              <span>{selectedBox === boxIndex && result ? result.reward.label : '?'}</span>
              <small>{selectedBox === boxIndex ? 'Opened' : `Box ${boxIndex + 1}`}</small>
            </button>
          ))}
        </section>

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
              <h2>Choose one box</h2>
              <p>Each box uses the same campaign reward engine and coupon claim flow.</p>
            </>
          )}
        </section>
      </main>

      <footer className="action-bar">
        <button className="primary-button" disabled type="button">
          {state === 'opening' ? 'Opening...' : alreadyAttempted ? 'Already Played' : 'Pick A Box Above'}
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

