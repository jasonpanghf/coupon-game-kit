import React, { useMemo, useState, type CSSProperties } from 'react';
import type { EmbedContext } from '../../embed/postMessage';
import { claimReward, type ClaimRewardResponse } from '../../reward/couponApi';
import { pickReward, type RewardResult, validateRewardConfig } from '../../reward/rewardEngine';
import type { CampaignConfig } from '../../reward/rewardConfig';
import { trackEvent } from '../../shared/analytics';
import { getStoredValue, setStoredValue } from '../../shared/storage';

type SpinWheelGameProps = {
  config: CampaignConfig;
  embedContext: EmbedContext;
};

type GameState = 'ready' | 'spinning' | 'complete';
type StoredReward = {
  result: RewardResult;
  claim: ClaimRewardResponse;
};

export function SpinWheelGame({ config, embedContext }: SpinWheelGameProps) {
  const attemptedKey = `${config.campaignId}:${embedContext.userId || 'anonymous'}:attempted`;
  const resultKey = `${config.campaignId}:${embedContext.userId || 'anonymous'}:result`;
  const storedReward = getStoredValue<StoredReward | null>(resultKey, null);
  const storedAttempted = getStoredValue(attemptedKey, false);
  const validation = useMemo(() => validateRewardConfig(config.rewards), [config.rewards]);
  const [alreadyAttempted, setAlreadyAttempted] = useState(storedAttempted);
  const [state, setState] = useState<GameState>(storedAttempted ? 'complete' : 'ready');
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<RewardResult | null>(storedReward?.result ?? null);
  const [claim, setClaim] = useState<ClaimRewardResponse | null>(storedReward?.claim ?? null);
  const [copyLabel, setCopyLabel] = useState('Copy Coupon');
  const canPlay = validation.valid && state !== 'spinning' && !alreadyAttempted;
  const isDevelopmentMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const gameType = config.game.type;

  const wheelBackground = useMemo(() => {
    const segmentSize = 360 / config.rewards.length;
    const stops = config.rewards.flatMap((reward, index) => {
      const start = index * segmentSize;
      const end = start + segmentSize;
      const color = reward.color || (index % 2 === 0 ? config.theme.primaryColor : '#00ACC1');
      return [`${color} ${start}deg`, `${color} ${end}deg`];
    });

    return `conic-gradient(${stops.join(', ')})`;
  }, [config.rewards, config.theme.primaryColor]);

  async function handleSpin() {
    if (!canPlay) {
      return;
    }

    setState('spinning');
    setClaim(null);
    trackEvent('game_started', {
      context: embedContext,
      gameType,
    });
    trackEvent('spin_started', {
      context: embedContext,
      gameType,
    });

    const selected = pickReward(config);
    setStoredValue(attemptedKey, true);
    setAlreadyAttempted(true);
    setRotation((current) => current + selected.spinDegrees);

    window.setTimeout(async () => {
      setResult(selected);
      trackEvent('spin_completed', {
        context: embedContext,
        gameType,
        rewardId: selected.reward.id,
        data: { result: selected },
      });
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
        data: {
          hasCoupon: Boolean(selected.reward.couponCode),
          result: selected,
        },
      });

      let claimResult: ClaimRewardResponse;
      try {
        claimResult = await claimReward({
          campaignId: selected.campaignId,
          userId: embedContext.userId,
          rewardId: selected.reward.id,
          couponCode: selected.reward.couponCode,
          source: embedContext.source,
        });
      } catch {
        claimResult = {
          claimId: `failed:${selected.campaignId}:${selected.reward.id}`,
          success: false,
          couponCode: null,
          message: 'We could not claim this reward right now. Please try again later.',
        };
      }
      setClaim(claimResult);
      setStoredValue<StoredReward>(resultKey, { result: selected, claim: claimResult });
      trackEvent('reward_claimed', {
        context: embedContext,
        gameType,
        rewardId: selected.reward.id,
        data: { result: selected, claim: claimResult },
      });
      setState('complete');
    }, config.game.spinDurationMs);
  }

  function handleResetDemo() {
    setStoredValue(attemptedKey, false);
    setStoredValue(resultKey, null);
    setAlreadyAttempted(false);
    setState('ready');
    setResult(null);
    setClaim(null);
    setRotation(0);
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
      data: {
        ctaLabel: result.reward.ctaLabel,
        ctaUrl: result.reward.ctaUrl,
      },
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
        <h1>{config.title}</h1>
        <p>{config.subtitle}</p>
        <dl className="embed-meta" aria-label="Embed context">
          <div>
            <dt>Campaign</dt>
            <dd>{embedContext.campaignId}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{embedContext.source}</dd>
          </div>
        </dl>
      </header>

      {!validation.valid ? (
        <section className="error-panel" role="alert">
          <p className="eyebrow">Config Error</p>
          <h2>This campaign is not available right now.</h2>
          <p>Please check reward probability and campaign settings.</p>
          <ul>
            {validation.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <main className="game-stage" aria-live="polite" hidden={!validation.valid}>
        <div className="wheel-wrap">
          <div className="wheel-pointer" aria-hidden="true" />
          <div
            className="wheel"
            style={{
              background: wheelBackground,
              transform: `rotate(${rotation}deg)`,
              transitionDuration: `${config.game.spinDurationMs}ms`,
            }}
          >
            {config.rewards.map((reward, index) => (
              <span
                className="wheel-label"
                key={reward.id}
                style={{ transform: `rotate(${index * (360 / config.rewards.length) + 360 / config.rewards.length / 2}deg)` }}
              >
                {reward.label}
              </span>
            ))}
          </div>
          <div className="wheel-hub">SPIN</div>
        </div>

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
              <h2>One spin, one reward</h2>
              <p>Rewards, probabilities, CTA, terms, and colors are loaded from campaign config.</p>
            </>
          )}
        </section>
      </main>

      <nav className="legal-links" aria-label="Campaign legal links">
        {config.legal.termsUrl ? (
          <a href={config.legal.termsUrl} target="_blank" rel="noreferrer">
            Terms
          </a>
        ) : null}
        {config.legal.privacyUrl ? (
          <a href={config.legal.privacyUrl} target="_blank" rel="noreferrer">
            Privacy
          </a>
        ) : null}
      </nav>

      <footer className="action-bar">
        <button className="primary-button" disabled={!canPlay} type="button" onClick={handleSpin}>
          {state === 'spinning' ? 'Spinning...' : alreadyAttempted ? 'Already Played' : 'Spin Now'}
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
