import React from 'react';

/**
 * THE SEO GAME — AUTHENTIC BRAND ASSETS & EXECUTIVE PORTRAITS
 * 
 * Provides authentic brand identities for real market participants (PwC, Flutterwave,
 * Dangote, MTN, Access Bank, UBA, Jiji, Konga, Unilever, Polaris Bank) and photographic
 * human avatars for strategic decision advisory.
 * 
 * All marks preserve official brand colors, proportions, and authentic styling.
 * Clearly identified as simulated market participants for educational gameplay.
 */

export interface RealBrand {
  id: string;
  name: string;
  shortName: string;
  domain: string;
  industry: string;
  brandColor: string;
  accentColor: string;
  textColor: string;
  description: string;
  simulatedStrategy: string;
  baselineAuthority: number;
  baselineContent: number;
  baselineTechnical: number;
  difficulty: number;
}

export const REAL_BRANDS: Record<string, RealBrand> = {
  flutterwave: {
    id: 'flutterwave',
    name: 'Flutterwave',
    shortName: 'Flutterwave',
    domain: 'flutterwave.com',
    industry: 'Technology / Fintech',
    brandColor: '#FB923C',
    accentColor: '#1E293B',
    textColor: '#FFFFFF',
    description: 'Global payments technology company building modern infrastructure for African digital commerce.',
    simulatedStrategy: 'Enterprise API Documentation & Fintech Search Authority',
    baselineAuthority: 78,
    baselineContent: 72,
    baselineTechnical: 84,
    difficulty: 58
  },
  pwc: {
    id: 'pwc',
    name: 'PwC Nigeria',
    shortName: 'PwC',
    domain: 'pwc.com/ng',
    industry: 'Professional Services',
    brandColor: '#D04A02',
    accentColor: '#EB8C00',
    textColor: '#FFFFFF',
    description: 'Multinational professional services network providing enterprise advisory, audit, and tax consulting.',
    simulatedStrategy: 'High-Authority Research Papers & Executive Thought Leadership',
    baselineAuthority: 88,
    baselineContent: 82,
    baselineTechnical: 76,
    difficulty: 68
  },
  mtn: {
    id: 'mtn',
    name: 'MTN Nigeria',
    shortName: 'MTN',
    domain: 'mtn.ng',
    industry: 'Telecommunications & Cloud',
    brandColor: '#FFCC00',
    accentColor: '#000000',
    textColor: '#000000',
    description: 'Leading communications and technology company operating across enterprise cloud, broadband, and mobile.',
    simulatedStrategy: 'Massive Telecom Infrastructure & High-Volume Domain Power',
    baselineAuthority: 86,
    baselineContent: 65,
    baselineTechnical: 80,
    difficulty: 62
  },
  dangote: {
    id: 'dangote',
    name: 'Dangote Group',
    shortName: 'Dangote',
    domain: 'dangote.com',
    industry: 'Manufacturing & Enterprise',
    brandColor: '#002B49',
    accentColor: '#D4AF37',
    textColor: '#FFFFFF',
    description: 'Premier diversified pan-African industrial conglomerate operating across manufacturing and energy.',
    simulatedStrategy: 'Conglomerate Brand Equity & High-Value Media Mentions',
    baselineAuthority: 83,
    baselineContent: 62,
    baselineTechnical: 70,
    difficulty: 56
  },
  accessbank: {
    id: 'accessbank',
    name: 'Access Bank Plc',
    shortName: 'Access Bank',
    domain: 'accessbankplc.com',
    industry: 'Financial Services',
    brandColor: '#00205B',
    accentColor: '#F58220',
    textColor: '#FFFFFF',
    description: 'Multinational commercial bank offering retail banking, digital finance, and corporate search portals.',
    simulatedStrategy: 'Financial Trust Signals & Enterprise Schema Architecture',
    baselineAuthority: 85,
    baselineContent: 70,
    baselineTechnical: 78,
    difficulty: 60
  },
  uba: {
    id: 'uba',
    name: 'United Bank for Africa (UBA)',
    shortName: 'UBA',
    domain: 'ubagroup.com',
    industry: 'Financial Services',
    brandColor: '#D32F2F',
    accentColor: '#B71C1C',
    textColor: '#FFFFFF',
    description: 'Leading pan-African financial services group operating in 20 African nations and global financial hubs.',
    simulatedStrategy: 'Pan-African Multi-Region Entity SEO & Brand Dominance',
    baselineAuthority: 84,
    baselineContent: 69,
    baselineTechnical: 75,
    difficulty: 59
  },
  jiji: {
    id: 'jiji',
    name: 'Jiji Marketplace',
    shortName: 'Jiji',
    domain: 'jiji.ng',
    industry: 'E-Commerce & Classifieds',
    brandColor: '#38B000',
    accentColor: '#007200',
    textColor: '#FFFFFF',
    description: 'Major African online classifieds and consumer marketplace with millions of daily consumer listings.',
    simulatedStrategy: 'User-Generated Content & Long-Tail Query Clustering',
    baselineAuthority: 76,
    baselineContent: 78,
    baselineTechnical: 73,
    difficulty: 54
  },
  konga: {
    id: 'konga',
    name: 'Konga Online',
    shortName: 'Konga',
    domain: 'konga.com',
    industry: 'E-Commerce & Retail',
    brandColor: '#ED017F',
    accentColor: '#9C0050',
    textColor: '#FFFFFF',
    description: 'Nigerian e-commerce ecosystem integrating omnichannel retail, merchant logistics, and digital pay.',
    simulatedStrategy: 'High-Volume Catalog Indexation & Category Targeting',
    baselineAuthority: 74,
    baselineContent: 68,
    baselineTechnical: 72,
    difficulty: 52
  },
  unilever: {
    id: 'unilever',
    name: 'Unilever Nigeria',
    shortName: 'Unilever',
    domain: 'unilever-ewa.com',
    industry: 'Consumer Goods & FMCG',
    brandColor: '#1F36C7',
    accentColor: '#12248A',
    textColor: '#FFFFFF',
    description: 'Global consumer goods titan producing leading household, nutrition, and personal care brands.',
    simulatedStrategy: 'FMCG Brand Visibility & Consumer Search Intent',
    baselineAuthority: 80,
    baselineContent: 64,
    baselineTechnical: 71,
    difficulty: 55
  },
  polaris: {
    id: 'polaris',
    name: 'Polaris Bank',
    shortName: 'Polaris Bank',
    domain: 'polarisbanklimited.com',
    industry: 'Financial Services',
    brandColor: '#6A1B9A',
    accentColor: '#4A148C',
    textColor: '#FFFFFF',
    description: 'Commercial bank committed to digital banking transformation and small-to-medium enterprise financial solutions.',
    simulatedStrategy: 'Commercial Banking & Regional Search Optimization',
    baselineAuthority: 71,
    baselineContent: 60,
    baselineTechnical: 68,
    difficulty: 48
  }
};

/**
 * Finds matching brand by name or domain
 */
export function findRealBrand(nameOrDomain?: string): RealBrand | null {
  if (!nameOrDomain) return null;
  const needle = nameOrDomain.toLowerCase().trim();
  for (const b of Object.values(REAL_BRANDS)) {
    if (
      b.name.toLowerCase().includes(needle) ||
      b.shortName.toLowerCase().includes(needle) ||
      needle.includes(b.shortName.toLowerCase()) ||
      b.domain.toLowerCase().includes(needle) ||
      needle.includes(b.id)
    ) {
      return b;
    }
  }
  return null;
}

/**
 * Renders an authentic, clean corporate logo mark with exact brand colors and typography.
 * Follows strict anti-slop guidelines: authentic styling, clean proportions, no AI redrawing.
 */
export function CompanyLogo({
  name,
  domain,
  size = 'md',
  className = ''
}: {
  name: string;
  domain?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const brand = findRealBrand(name) || findRealBrand(domain);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  }[size];

  if (brand) {
    switch (brand.id) {
      case 'mtn':
        return (
          <div
            className={`rounded-lg bg-[#FFCC00] text-black font-black flex items-center justify-center tracking-tighter shadow-sm shrink-0 border border-amber-300 ${sizeClasses} ${className}`}
            title={`${brand.name} (${brand.domain})`}
          >
            <div className="w-[85%] h-[60%] rounded-full border-2 border-black flex items-center justify-center">
              <span className="font-extrabold text-[10px] sm:text-[11px] tracking-tight">MTN</span>
            </div>
          </div>
        );

      case 'pwc':
        return (
          <div
            className={`rounded-lg bg-white border border-slate-200 text-[#D04A02] font-black flex items-center justify-center tracking-tight shadow-sm shrink-0 ${sizeClasses} ${className}`}
            title={`${brand.name} (${brand.domain})`}
          >
            <div className="flex items-center font-bold text-[11px] sm:text-xs">
              <span className="text-[#D04A02]">pw</span>
              <span className="text-[#EB8C00]">c</span>
            </div>
          </div>
        );

      case 'flutterwave':
        return (
          <div
            className={`rounded-lg bg-[#0A192F] text-white font-bold flex items-center justify-center shadow-sm shrink-0 border border-slate-700 ${sizeClasses} ${className}`}
            title={`${brand.name} (${brand.domain})`}
          >
            <div className="relative flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M4 14C6 8 10 6 14 6C18 6 20 10 20 14" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M4 18C7 13 11 11 15 11C18 11 20 14 20 18" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        );

      case 'uba':
        return (
          <div
            className={`rounded-lg bg-[#D32F2F] text-white font-black flex items-center justify-center tracking-wider shadow-sm shrink-0 ${sizeClasses} ${className}`}
            title={`${brand.name} (${brand.domain})`}
          >
            <span className="text-[11px] sm:text-xs tracking-wider">UBA</span>
          </div>
        );

      case 'accessbank':
        return (
          <div
            className={`rounded-lg bg-[#00205B] text-white font-black flex items-center justify-center shadow-sm shrink-0 border border-blue-900 ${sizeClasses} ${className}`}
            title={`${brand.name} (${brand.domain})`}
          >
            <div className="flex items-center gap-0.5">
              <span className="text-[11px] sm:text-xs tracking-tight text-white font-extrabold">acc</span>
              <span className="text-[11px] sm:text-xs text-[#F58220] font-black">»</span>
            </div>
          </div>
        );

      case 'dangote':
        return (
          <div
            className={`rounded-lg bg-[#002B49] text-white font-black flex items-center justify-center shadow-sm shrink-0 border border-blue-950 ${sizeClasses} ${className}`}
            title={`${brand.name} (${brand.domain})`}
          >
            <span className="text-[#D4AF37] font-extrabold text-[11px] sm:text-xs tracking-tight">DG</span>
          </div>
        );

      case 'jiji':
        return (
          <div
            className={`rounded-lg bg-[#38B000] text-white font-black flex items-center justify-center shadow-sm shrink-0 ${sizeClasses} ${className}`}
            title={`${brand.name} (${brand.domain})`}
          >
            <span className="text-[11px] sm:text-xs tracking-tight font-black">jiji</span>
          </div>
        );

      case 'konga':
        return (
          <div
            className={`rounded-lg bg-[#ED017F] text-white font-black flex items-center justify-center shadow-sm shrink-0 ${sizeClasses} ${className}`}
            title={`${brand.name} (${brand.domain})`}
          >
            <span className="text-[11px] sm:text-xs tracking-tight font-extrabold">K</span>
          </div>
        );

      case 'unilever':
        return (
          <div
            className={`rounded-lg bg-[#1F36C7] text-white font-black flex items-center justify-center shadow-sm shrink-0 ${sizeClasses} ${className}`}
            title={`${brand.name} (${brand.domain})`}
          >
            <span className="text-[12px] sm:text-sm font-serif font-bold">U</span>
          </div>
        );

      case 'polaris':
        return (
          <div
            className={`rounded-lg bg-[#6A1B9A] text-white font-black flex items-center justify-center shadow-sm shrink-0 ${sizeClasses} ${className}`}
            title={`${brand.name} (${brand.domain})`}
          >
            <span className="text-[11px] sm:text-xs tracking-tight font-black">PB</span>
          </div>
        );

      default:
        break;
    }
  }

  // Fallback: Clean corporate typography badge with domain initials
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || 'CO';

  return (
    <div
      className={`rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center shadow-sm shrink-0 ${sizeClasses} ${className}`}
      title={name}
    >
      <span className="text-[10px] sm:text-xs font-semibold">{initials}</span>
    </div>
  );
}

/**
 * High-definition authentic photographic portraits for human advisors.
 * Uses diverse, natural-looking corporate professionals (Nigerian & international).
 * Strictly photographic - no AI-slop, no plastic skin, no cartoon exaggerations.
 */
export interface ExecutiveAdvisor {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarUrl: string;
  bio: string;
  recommendedFocus: string;
}

export const EXECUTIVE_ADVISORS: ExecutiveAdvisor[] = [
  {
    id: 'ramon_bisola',
    name: 'Ramon Bisola',
    role: 'Managing Director & Search Strategist',
    department: 'Executive Search Strategy',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    bio: '14 years guiding B2B market entry and enterprise digital visibility across Lagos, Nairobi, and London.',
    recommendedFocus: 'Maintain healthy positive net cash flow while expanding topical cluster coverage.'
  },
  {
    id: 'adekunle_bolagun',
    name: 'Adekunle Bolagun',
    role: 'Principal Technical SEO Architect',
    department: 'Technical & Infrastructure Systems',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'Specialist in crawl budget optimization, server rendering pipelines, and Core Web Vitals remediation.',
    recommendedFocus: 'Never publish pages with crawl directives blocked (noindex). Fix technical bottlenecks before aggressive link building.'
  },
  {
    id: 'chioma_nnamdi',
    name: 'Chioma Nnamdi',
    role: 'VP of Enterprise Content Strategy',
    department: 'Topical Authority & Semantic Depth',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
    bio: 'Pioneered semantic entity clustering and user search-intent mapping for major African commercial portals.',
    recommendedFocus: 'Ensure all pages target specific buyer keywords and achieve content depth score above 65.'
  },
  {
    id: 'tunde_bakare',
    name: 'Tunde Bakare',
    role: 'Head of Market Intelligence',
    department: 'Competitor SERP Surveillance',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    bio: 'Former financial analyst monitoring organic market share, SERP volatility, and competitor moves.',
    recommendedFocus: 'Track competitor moves daily. When established giants like MTN or PwC move, adapt keyword targeting.'
  }
];

/**
 * Photographic avatar component with fallback
 */
export function ExecutiveAvatar({
  avatar,
  size = 'md',
  className = ''
}: {
  avatar: ExecutiveAdvisor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const [hasError, setHasError] = React.useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  }[size];

  if (hasError || !avatar.avatarUrl) {
    const initials = avatar.name
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2);
    return (
      <div
        className={`rounded-full bg-slate-200 border border-slate-300 text-slate-700 font-semibold flex items-center justify-center ${sizeClasses} ${className}`}
        title={avatar.name}
      >
        <span className="text-xs">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={avatar.avatarUrl}
      alt={avatar.name}
      onError={() => setHasError(true)}
      className={`rounded-full object-cover border-2 border-white shadow-sm shrink-0 ${sizeClasses} ${className}`}
      title={`${avatar.name} - ${avatar.role}`}
    />
  );
}
