import { TalentCandidate } from '../types';

export const MOCK_TALENT: TalentCandidate[] = [
  {
    id: 'T1',
    name: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    role: 'Growth Marketing Lead',
    specialization: 'Growth Marketing',
    verificationBadge: 'Verified Professional',
    skills: ['Conversion Rate Optimization', 'A/B Testing', 'Google Analytics 4', 'User Acquisition', 'SQL', 'Attribution Modeling'],
    availability: 'Available Immediately',
    portfolioScore: 98,
    location: 'Nairobi, Kenya',
    email: 's.jenkins@vetted.dsptalenthub.com',
    phone: '+254 712 345 678',
    experienceCount: 5,
    bio: 'Vetted through our intensive Professional Verification assessment. Led dynamic acquisition campaigns and client-facing conversion rate optimizations.',
    about: 'High-performing Growth Lead with 5+ years of experience steering performance marketing, multi-channel customer acquisition, and dynamic lifecycle engagement. Proven ability to scale ARR, manage digital asset budgets, and establish clean attribution models.',
    featuredProject: {
      title: 'SaaS User Activation Redesign',
      metrics: '+42% sign-up to trial activation rate'
    },
    projects: [
      {
        title: 'SaaS User Activation Funnel Optimization',
        description: 'Redesigned user onboarding copy, reduced sign-up steps, and deployed behavior-triggered lifecycle emails based on Mixpanel events.',
        metrics: 'Drove a +42% lift in sign-up-to-trial activation rates over a 90-day span.',
        tools: ['Klaviyo', 'Mixpanel', 'Figma', 'A/B Testing'],
        year: '2025'
      },
      {
        title: 'FinTech Growth Launch Campaign',
        description: 'Coordinated Google Paid Search and micro-sponsored content targeting tech-professionals in East Africa.',
        metrics: 'Acquired 12,000 active tier-1 users with a CAC 30% below projections.',
        tools: ['Google Ads', 'Meta Ads', 'GA4'],
        year: '2026'
      }
    ],
    caseStudies: [
      {
        title: 'Plural FinTech Integration Campaign',
        problem: 'SaaS onboarding friction was causing a 65% drop-off right before the critical payment integration stage.',
        solution: 'Implemented visual tooltips, dynamic checklist guides, and automated SMS fallback reminders using Twilio API hooks.',
        results: 'Boosted integration completion rates by 38% and lowered overall technical support tickets by half.'
      }
    ],
    certifications: [
      { name: 'DSP Professional Growth Accreditation (Score: 98/100)' },
      { name: 'Google Ads Search & Measurement Certified' },
      { name: 'Reforge Growth Series Graduate' }
    ].map(c => c.name),
    recommendations: [
      {
        author: 'Adeola Adebayo',
        role: 'VP of Product',
        company: 'Verve Tech',
        avatar: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=150',
        text: 'Sarah is an execution champion. Her technical command over analytics tools and rapid experimentation pace turned our metrics around in weeks.'
      }
    ]
  },
  {
    id: 'T2',
    name: 'Marcus Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    role: 'AI Automation Operations Architect',
    specialization: 'AI Automation',
    verificationBadge: 'Top Performer',
    skills: ['Zapier Enterprise', 'Make.com', 'Gemini API Orchestration', 'n8n', 'Python Scripts', 'Vector Databases', 'CRM Syncing'],
    availability: 'Interviews Open',
    portfolioScore: 99,
    location: 'Lagos, Nigeria',
    email: 'm.chen@vetted.dsptalenthub.com',
    phone: '+234 803 111 2222',
    experienceCount: 4,
    bio: 'Ranked in the top 1% of the AI Automation assessment pipeline. Specializes in building headless automated agents that sync complex business data.',
    about: 'Technical operations specialist dedicated to automating manual overhead, connecting APIs, and integrating LLMs securely inside corporate environments.',
    featuredProject: {
      title: 'Customer Onboarding Auto-pilot',
      metrics: 'Saved 35 engineering hours/week, 4m setup latency'
    },
    projects: [
      {
        title: 'Customer Onboarding Auto-pilot',
        description: 'Designed and deployed an automated trigger flow syncing server webhooks to HubSpot CRM and triggering custom client instances.',
        metrics: 'Reduced onboarding delay from 48h to 4m, saving 35 engineering hr/wk.',
        tools: ['Make.com', 'Zapier', 'Python', 'HubSpot API'],
        year: '2025'
      }
    ],
    caseStudies: [
      {
        title: 'LLM Document Classifier Engine',
        problem: 'Support agents spent over 3 hours daily sorting incoming medical billing receipts and categorization schemas manually.',
        solution: 'Built a background serverless pipeline sorting attachments via Gemini API and auto-extracting metadata structures.',
        results: 'Handled 14,000 claims with 99.4% classification accuracy in near real-time.'
      }
    ],
    certifications: [
      { name: 'DSP Core AI Architect Certification (Score: 99/100)' },
      { name: 'n8n Advanced Workflow Creator Accreditation' }
    ].map(c => c.name),
    recommendations: [
      {
        author: 'Kofi Larbi',
        role: 'Director of Operations',
        company: 'SupaExpress Africa',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
        text: 'Marcus took a messy, manual intake pipeline and turned it into a completely autonomous engine. He is brilliant, fast, and highly reliable.'
      }
    ]
  },
  {
    id: 'T3',
    name: 'Amara Okafor',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    role: 'SEO Strategist & Content Architect',
    specialization: 'SEO',
    verificationBadge: 'Verified Professional',
    skills: ['Technical SEO Audit', 'Keyword Intelligence', 'Ahrefs Power-User', 'Programmatic SEO', 'Screaming Frog', 'Link Building'],
    availability: 'Available Immediately',
    portfolioScore: 95,
    location: 'Cape Town, South Africa',
    email: 'a.okafor@vetted.dsptalenthub.com',
    phone: '+27 21 954 1109',
    experienceCount: 6,
    bio: 'Specialist in programmatic SEO and dynamic semantic clustering. Built content blueprints that captured 1.2M annual search occurrences.',
    about: 'Technical SEO champion who designs high-intent copy systems and fixes structural domain indexation errors. Deep focus on search query mapping and intent clustering.',
    featuredProject: {
      title: 'Programmatic SEO Directory Build',
      metrics: 'Grew organic traffic from 5k to 120k monthly within 90 days'
    },
    projects: [
      {
        title: 'Programmatic Real Estate Pages',
        description: 'Designed a dynamic template routing database objects into SEO landing pages with automated custom schema markup.',
        metrics: 'Ranked over 8,500 target geographical keywords on page 1 of Google.',
        tools: ['Programmatic SEO', 'Next.js', 'Semrush', 'Google Console'],
        year: '2025'
      }
    ],
    caseStudies: [
      {
        title: 'Global AgriTech Directory Scaling',
        problem: 'An AgriTech platform was invisible to searches regarding crop types and regional supply terms.',
        solution: 'Built a clean indexation blueprint, resolved duplicate content tags, and scaled 3,000 semantic data pages.',
        results: 'Increased organic discovery clicks by 240% inside 120 days.'
      }
    ],
    certifications: [
      { name: 'DSP Technical SEO Validation License' },
      { name: 'Ahrefs Power-User Certification' }
    ].map(c => c.name),
    recommendations: [
      {
        author: 'Sandra Cole',
        role: 'Head of Growth',
        company: 'AgriCorp Tech',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        text: 'Amara possesses rare clarity regarding SEO. She does not guess; her schema edits and indexation fixes delivered instant page-1 rankings.'
      }
    ]
  },
  {
    id: 'T4',
    name: 'Liam Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    role: 'Paid Acquisition & PPC Engineer',
    specialization: 'PPC',
    verificationBadge: 'Verified Intern',
    skills: ['Google Paid Search', 'Meta Ads Manager', 'RoAS Strategy', 'Creative Testing', 'Retargeting Flow', 'Pixel Troubleshooting'],
    availability: 'Available Immediately',
    portfolioScore: 92,
    location: 'Accra, Ghana',
    email: 'l.vance@vetted.dsptalenthub.com',
    phone: '+233 244 555 666',
    experienceCount: 3,
    bio: 'Vetted PPC specialist with rigorous sandbox validation. Expert at balancing bidding algorithms and conversion tracking.',
    about: 'analytical Paid Acquisition Manager focused on maximizing RoAS. Skilled at search term audits, negative query structures, and creative optimization frameworks.',
    featuredProject: {
      title: 'B2B Lead Generation Re-modeling',
      metrics: 'Decreased Cost-Per-Lead (CPL) by 31% while staying scale-stable'
    }
  },
  {
    id: 'T5',
    name: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    role: 'Social Media & Brand Builder',
    specialization: 'Social Media',
    verificationBadge: 'Internship Graduate',
    skills: ['Short-form Video Edit', 'Brand Positioning', 'TikTok Analytics', 'Community Moderation', 'CapCut Pro', 'Influencer Briefing'],
    availability: 'Onboard in 1 Week',
    portfolioScore: 94,
    location: 'Kigali, Rwanda',
    email: 'e.rostova@vetted.dsptalenthub.com',
    phone: '+250 788 123 456',
    experienceCount: 3,
    bio: 'Professional Verification in Social Media Performance. Experienced in deploying viral content formulas and organic outreach strategies.',
    about: 'Creative content strategist specialized in building audience engines on TikTok, Instagram, and LinkedIn. Merges video metrics with product value propositions.',
    featuredProject: {
      title: 'Viral Brand Campaign Launch',
      metrics: '2.4 Million native views, 40,000 uses'
    }
  },
  {
    id: 'T6',
    name: 'David Kim',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    role: 'Lifecycle & Email Marketer',
    specialization: 'Email Marketing',
    verificationBadge: 'Verified Professional',
    skills: ['Klaviyo Flow Architecture', 'Customer Segmentation', 'Copywriting', 'Deliverability Audit', 'HTML Templates', 'Behavioral Email Campaigns'],
    availability: 'Interviews Open',
    portfolioScore: 96,
    location: 'Lagos, Nigeria',
    email: 'd.kim@vetted.dsptalenthub.com',
    phone: '+234 812 777 8888',
    experienceCount: 4,
    bio: 'Email systems manager specializing in cart abandonment and active customer winback triggered hierarchies.',
    about: 'Data-driven CRM marketer targeting high-intent segments, designing high-conversion copy, and optimizing IP warmups for safe inbox delivery.',
    featuredProject: {
      title: 'Cart Recovery Pipeline Optimization',
      metrics: 'Recovered $142,000 in customer checkouts in 60 days'
    }
  }
];
