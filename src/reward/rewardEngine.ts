import type { CampaignConfig, RewardItem } from './rewardConfig';

export type RewardResult = {
  campaignId: string;
  reward: RewardItem;
  selectedAt: string;
  spinDegrees: number;
};

export type RewardConfigValidation = {
  valid: boolean;
  errors: string[];
  totalProbability: number;
};

export function validateRewardConfig(rewards: RewardItem[]): RewardConfigValidation {
  const errors: string[] = [];

  if (!Array.isArray(rewards) || rewards.length === 0) {
    errors.push('Campaign must include at least one reward.');
  }

  for (const reward of rewards) {
    if (!reward.id) {
      errors.push('Each reward must include an id.');
    }

    if (!reward.label) {
      errors.push(`Reward "${reward.id || 'unknown'}" must include a label.`);
    }

    if (!Number.isFinite(reward.probability) || reward.probability < 0) {
      errors.push(`Reward "${reward.id || 'unknown'}" has an invalid probability.`);
    }
  }

  const totalProbability = rewards.reduce((sum, reward) => sum + (Number(reward.probability) || 0), 0);

  if (totalProbability !== 100) {
    errors.push(`Reward probability total must equal 100. Current total is ${totalProbability}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    totalProbability,
  };
}

export function pickReward(config: CampaignConfig, random = Math.random): RewardResult {
  const validation = validateRewardConfig(config.rewards);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const availableRewards = config.rewards.filter((reward) => {
    return reward.probability > 0 && (reward.limit === undefined || reward.limit > 0);
  });
  const totalWeight = availableRewards.reduce((sum, reward) => sum + reward.probability, 0);

  if (availableRewards.length === 0 || totalWeight <= 0) {
    throw new Error('Campaign has no available rewards.');
  }

  let cursor = random() * totalWeight;
  let selected = availableRewards[availableRewards.length - 1];

  for (const reward of availableRewards) {
    cursor -= reward.probability;
    if (cursor <= 0) {
      selected = reward;
      break;
    }
  }

  return {
    campaignId: config.campaignId,
    reward: selected,
    selectedAt: new Date().toISOString(),
    spinDegrees: calculateSpinDegrees(config.rewards, selected, random),
  };
}

function calculateSpinDegrees(rewards: RewardItem[], selected: RewardItem, random: () => number) {
  const segmentSize = 360 / rewards.length;
  const selectedIndex = Math.max(0, rewards.findIndex((reward) => reward.id === selected.id));
  const segmentCenter = selectedIndex * segmentSize + segmentSize / 2;
  const jitter = (random() - 0.5) * segmentSize * 0.4;
  const pointerOffset = 270;
  const fullSpins = 5 * 360;

  return fullSpins + pointerOffset - segmentCenter + jitter;
}
