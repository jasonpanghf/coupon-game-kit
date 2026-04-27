export type ClaimRewardRequest = {
  campaignId: string;
  userId?: string;
  rewardId: string;
  couponCode?: string | null;
  source?: string;
};

export type ClaimRewardResponse = {
  claimId: string;
  success: boolean;
  couponCode?: string | null;
  message?: string;
};

export async function claimReward(request: ClaimRewardRequest): Promise<ClaimRewardResponse> {
  // MVP mock only. Replace this function with a backend call before issuing real production coupons.
  // Production backend should validate eligibility, prevent duplicate claims, issue unique codes,
  // record reward history, and enforce campaign limits.
  if (!request.couponCode) {
    return {
      claimId: `mock:${request.campaignId}:${request.userId || 'anonymous'}:${request.rewardId}`,
      success: true,
      couponCode: null,
      message: 'No coupon code is attached to this reward.',
    };
  }

  return {
    claimId: `mock:${request.campaignId}:${request.userId || 'anonymous'}:${request.rewardId}`,
    success: true,
    couponCode: request.couponCode,
    message: 'Mock coupon claimed. Production must validate this server-side.',
  };
}
