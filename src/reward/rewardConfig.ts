export type RewardItem = {
  id: string;
  label: string;
  description: string;
  couponCode?: string | null;
  probability: number;
  ctaLabel?: string;
  ctaUrl?: string;
  terms?: string;
  color?: string;
  limit?: number;
};

export type CampaignConfig = {
  campaignId: string;
  campaignName: string;
  locale: 'en' | 'ja' | 'zh-HK' | string;
  title: string;
  subtitle: string;
  brandName: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    buttonColor: string;
    buttonTextColor: string;
  };
  game: {
    type: 'spin-wheel' | 'scratch-card' | 'mystery-box';
    maxAttemptsPerUser: number;
    spinDurationMs: number;
    showConfetti: boolean;
  };
  rewards: RewardItem[];
  legal: {
    termsUrl?: string;
    privacyUrl?: string;
  };
};

export const defaultCampaignConfig: CampaignConfig = {
  campaignId: 'hotel-spring-2026',
  campaignName: 'Spring Travel Lucky Spin',
  locale: 'en',
  title: 'Spin to Win',
  subtitle: 'Try your luck and win a special travel coupon.',
  brandName: 'Tabi Life',
  theme: {
    primaryColor: '#1E88E5',
    secondaryColor: '#FFFFFF',
    backgroundColor: '#F7FAFC',
    buttonColor: '#1E88E5',
    buttonTextColor: '#FFFFFF',
  },
  game: {
    type: 'spin-wheel',
    maxAttemptsPerUser: 1,
    spinDurationMs: 4200,
    showConfetti: true,
  },
  rewards: [
    {
      id: 'reward_10_off',
      label: '10% OFF',
      description: 'Save 10% on your next booking.',
      couponCode: 'SPRING10',
      probability: 40,
      ctaLabel: 'Use Coupon',
      ctaUrl: 'https://example.com/booking',
      terms: 'Valid until 2026-06-30.',
      color: '#1E88E5',
      limit: 500,
    },
    {
      id: 'reward_drink',
      label: 'Free Drink',
      description: 'Enjoy one free drink at the hotel lounge.',
      couponCode: 'DRINK2026',
      probability: 30,
      ctaLabel: 'View Details',
      ctaUrl: 'https://example.com/lounge',
      terms: 'Valid during your stay.',
      color: '#00ACC1',
      limit: 150,
    },
    {
      id: 'reward_no_prize',
      label: 'Try Again',
      description: 'No prize this time.',
      couponCode: null,
      probability: 30,
      ctaLabel: 'See Other Offers',
      ctaUrl: 'https://example.com/offers',
      terms: '',
      color: '#64748B',
    },
  ],
  legal: {
    termsUrl: 'https://example.com/terms',
    privacyUrl: 'https://example.com/privacy',
  },
};
