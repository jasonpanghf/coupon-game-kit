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
      probability: 30,
      ctaLabel: 'Use Coupon',
      ctaUrl: 'https://example.com/booking',
      terms: 'Valid until 2026-06-30.',
      color: '#1E88E5',
      limit: 500,
    },
    {
      id: 'reward_50_off',
      label: '50% OFF',
      description: 'Save 50% on one selected stay package.',
      couponCode: 'HALFSTAY',
      probability: 4,
      ctaLabel: 'Book Now',
      ctaUrl: 'https://example.com/booking',
      terms: 'Valid for selected dates and room types only.',
      color: '#E11D48',
      limit: 30,
    },
    {
      id: 'reward_free_stay',
      label: 'Free Stay',
      description: 'Win a complimentary one-night stay voucher.',
      couponCode: 'FREESTAY',
      probability: 2,
      ctaLabel: 'Claim Stay',
      ctaUrl: 'https://example.com/free-stay',
      terms: 'Blackout dates apply. Backend validation required for production.',
      color: '#7C3AED',
      limit: 5,
    },
    {
      id: 'reward_drink',
      label: 'Free Drink',
      description: 'Enjoy one free drink at the hotel lounge.',
      couponCode: 'DRINK2026',
      probability: 14,
      ctaLabel: 'View Details',
      ctaUrl: 'https://example.com/lounge',
      terms: 'Valid during your stay.',
      color: '#00ACC1',
      limit: 150,
    },
    {
      id: 'reward_breakfast',
      label: 'Breakfast',
      description: 'Get one complimentary breakfast set.',
      couponCode: 'BREAKFAST',
      probability: 12,
      ctaLabel: 'View Menu',
      ctaUrl: 'https://example.com/breakfast',
      terms: 'Valid for dine-in only.',
      color: '#F59E0B',
      limit: 120,
    },
    {
      id: 'reward_late_checkout',
      label: 'Late Checkout',
      description: 'Enjoy late checkout until 2pm.',
      couponCode: 'LATE2PM',
      probability: 10,
      ctaLabel: 'View Stay Perks',
      ctaUrl: 'https://example.com/perks',
      terms: 'Subject to room availability.',
      color: '#0F766E',
      limit: 90,
    },
    {
      id: 'reward_room_upgrade',
      label: 'Upgrade',
      description: 'Get a room upgrade voucher.',
      couponCode: 'UPGRADE',
      probability: 8,
      ctaLabel: 'View Rooms',
      ctaUrl: 'https://example.com/rooms',
      terms: 'Valid for selected room categories only.',
      color: '#2563EB',
      limit: 60,
    },
    {
      id: 'reward_spa',
      label: 'Spa 20% OFF',
      description: 'Enjoy 20% off selected spa treatments.',
      couponCode: 'SPA20',
      probability: 8,
      ctaLabel: 'Book Spa',
      ctaUrl: 'https://example.com/spa',
      terms: 'Advance booking required.',
      color: '#DB2777',
      limit: 80,
    },
    {
      id: 'reward_transfer',
      label: 'Transfer',
      description: 'Get a free local shuttle transfer.',
      couponCode: 'RIDEFREE',
      probability: 7,
      ctaLabel: 'Reserve Ride',
      ctaUrl: 'https://example.com/transfer',
      terms: 'Valid for selected local routes.',
      color: '#16A34A',
      limit: 70,
    },
    {
      id: 'reward_no_prize',
      label: 'Try Again',
      description: 'No prize this time.',
      couponCode: null,
      probability: 5,
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
