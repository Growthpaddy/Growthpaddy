export interface RecruiterPackageItem {
  id: 'Starter' | 'Enterprise';
  name: string;
  tagline: string;
  price: string;
  billingCycle: string;
  unlockLimit: number;
  features: string[];
  isRecommended: boolean;
}

export const RECRUITER_PACKAGES: RecruiterPackageItem[] = [
  {
    id: 'Starter',
    name: 'Starter',
    tagline: 'Pay-As-You-Go',
    price: '₦35,000',
    billingCycle: 'One-Time',
    unlockLimit: 5,
    features: [
      '5 Pre-Vetted Contact Unlocks',
      'Direct WhatsApp & verified email',
      '0% Ongoing placement fees'
    ],
    isRecommended: false
  },
  {
    id: 'Enterprise',
    name: 'Enterprise',
    tagline: 'Scale Hiring',
    price: '₦250,000',
    billingCycle: 'Year',
    unlockLimit: 99999,
    features: [
      'UNLIMITED Talent Unlocks (365 Days)',
      '3-Month Co-Supervision Support',
      'Dedicated Talent Matchmaker'
    ],
    isRecommended: true
  }
];
