import { supabase } from './supabaseClient';
import { FounderProfile, getCachedFounderProfile } from './founderAuth';
import { 
  FounderArticle, 
  FounderPodcast, 
  FounderTask, 
  FounderDailyGoal, 
  FounderDistraction, 
  FounderAppointment, 
  FounderObjective, 
  FounderKeyResult 
} from '../types';
import founderHeroPhoto from '../assets/images/nigerian_founder_hero_1792406308716.jpg';

const FOUNDER_DATA_KEY_PREFIX = 'dc_founder_workspace_';

// Initial baseline data for Ezeji Patrick (matching approved UI screenshot)
export const DEFAULT_EZEJI_PROFILE: FounderProfile = {
  id: 'founder_ezeji_patrick_dsp',
  full_name: 'Ezeji Patrick',
  email: 'dspacademyonline@gmail.com',
  headline: 'Founder, DSP Academy',
  bio: "I'm a tech founder and community builder passionate about helping young Africans turn ideas into sustainable businesses through technology, skills and access to opportunities.",
  business_name: 'DSP Academy',
  website: 'https://dspacademy.online',
  slug: 'ezeji-patrick',
  location: 'Lagos, Nigeria',
  profile_status: 'approved',
  avatar_url: founderHeroPhoto,
  created_at: '2025-01-15T09:00:00Z',
  updated_at: new Date().toISOString()
};

export const INITIAL_PUBLISHED_ARTICLES: FounderArticle[] = [
  {
    id: 'art-1',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'From Idea to First Customer: Lessons for Early-Stage Founders',
    slug: 'from-idea-to-first-customer',
    excerpt: 'Key strategies learned on the ground in Lagos for validating real customer pain points and securing initial paying clients.',
    content: 'Building a sustainable venture starts with intense customer proximity. Too many founders build behind closed doors for months only to find nobody is willing to pay.',
    reading_time_minutes: 6,
    status: 'published',
    views_count: 342,
    cover_image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    published_at: '2025-03-10T10:00:00Z',
    created_at: '2025-03-08T10:00:00Z'
  },
  {
    id: 'art-2',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'Building in Nigeria: Opportunities Many Founders Overlook',
    slug: 'building-in-nigeria-opportunities',
    excerpt: 'Why local market constraints in logistics, education, and talent aggregation create the largest asymmetric upside for resilient teams.',
    content: 'Operating in volatile emerging economies requires extreme agility and unit economics discipline from day zero.',
    reading_time_minutes: 8,
    status: 'published',
    views_count: 512,
    cover_image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    published_at: '2025-02-24T14:30:00Z',
    created_at: '2025-02-20T12:00:00Z'
  },
  {
    id: 'art-3',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'The Founder Mindset: Discipline, Focus and Long-Term Thinking',
    slug: 'the-founder-mindset-discipline',
    excerpt: 'How early habit loops, emotional resilience, and deep focus protection determine whether a startup survives year three.',
    content: 'Distraction is the number one killer of early-stage startups. Protecting your cognitive energy daily is more important than working 16 chaotic hours.',
    reading_time_minutes: 5,
    status: 'published',
    views_count: 420,
    cover_image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    published_at: '2025-02-12T09:15:00Z',
    created_at: '2025-02-10T09:00:00Z'
  },
  {
    id: 'art-4',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'Digital Skills Training as an Engine of Community Wealth',
    slug: 'digital-skills-training-community-wealth',
    excerpt: 'Connecting ambitious university graduates with high-demand remote digital roles in tech.',
    content: 'Practical vocational education in SEO, automation, and programming transforms family trajectories in a matter of months.',
    reading_time_minutes: 7,
    status: 'published',
    views_count: 280,
    cover_image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    published_at: '2025-01-29T16:00:00Z',
    created_at: '2025-01-25T11:00:00Z'
  },
  {
    id: 'art-5',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'Bootstrapping vs Venture Capital in West Africa',
    slug: 'bootstrapping-vs-venture-capital-west-africa',
    excerpt: 'A pragmatic framework for deciding whether your business model truly requires institutional funding or revenue focus.',
    content: 'Revenue is the cleanest form of validation and investor leverage.',
    reading_time_minutes: 6,
    status: 'published',
    views_count: 390,
    cover_image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    published_at: '2025-01-14T08:30:00Z',
    created_at: '2025-01-10T10:00:00Z'
  },
  {
    id: 'art-6',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'Mastering the Art of Founder Time Allocation',
    slug: 'mastering-the-art-of-founder-time-allocation',
    excerpt: 'Why 80% of your progress comes from 2 high-leverage decisions each week.',
    content: 'Protecting your focus blocks from micro-meetings and distractions is a strategic superpower.',
    reading_time_minutes: 4,
    status: 'published',
    views_count: 210,
    cover_image_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
    published_at: '2024-12-28T11:00:00Z',
    created_at: '2024-12-24T12:00:00Z'
  },
  {
    id: 'art-7',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'Customer Discovery: How to Conduct 30 Interviews in 10 Days',
    slug: 'customer-discovery-30-interviews',
    excerpt: 'A step-by-step interview script for extracting raw, unfiltered feedback from prospective users.',
    content: 'Never pitch your solution during discovery; listen obsessively to where they currently spend money and lose sleep.',
    reading_time_minutes: 9,
    status: 'published',
    views_count: 315,
    cover_image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    published_at: '2024-12-15T15:00:00Z',
    created_at: '2024-12-10T14:00:00Z'
  },
  {
    id: 'art-8',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'Navigating Regulatory & Compliance Hurdles in African Tech',
    slug: 'navigating-regulatory-compliance-african-tech',
    excerpt: 'Essential tax, business registration, and banking foundations every founder must resolve early.',
    content: 'Setting up sound legal foundations prevents costly restructuring during funding rounds.',
    reading_time_minutes: 5,
    status: 'published',
    views_count: 450,
    cover_image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    published_at: '2024-11-30T10:00:00Z',
    created_at: '2024-11-25T10:00:00Z'
  }
];

export const INITIAL_DRAFT_ARTICLES: FounderArticle[] = [
  {
    id: 'draft-1',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'Pricing Strategies for African SaaS Startups: Lessons in Localized Billing',
    slug: 'pricing-strategies-african-saas',
    excerpt: 'Analyzing local card acceptance vs wire vs direct debit dynamics.',
    content: 'Draft content in progress...',
    reading_time_minutes: 7,
    status: 'draft',
    views_count: 0,
    published_at: null,
    created_at: '2025-03-09T14:00:00Z'
  },
  {
    id: 'draft-2',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'Hiring Your First 5 Team Members: Vetting for Hunger and Competence',
    slug: 'hiring-first-5-team-members',
    excerpt: 'Why cultural alignment and problem-solving tenacity outperform generic credentials in early stages.',
    content: 'Draft content in progress...',
    reading_time_minutes: 6,
    status: 'draft',
    views_count: 0,
    published_at: null,
    created_at: '2025-03-05T11:00:00Z'
  },
  {
    id: 'draft-3',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'Navigating FX Volatility and Multi-Currency Accounts as an Emerging Founder',
    slug: 'navigating-fx-volatility-multi-currency',
    excerpt: 'Practical hedging, treasury safety, and dollar invoicing methods for digital service providers.',
    content: 'Draft content in progress...',
    reading_time_minutes: 8,
    status: 'draft',
    views_count: 0,
    published_at: null,
    created_at: '2025-03-01T09:00:00Z'
  }
];

export const INITIAL_PODCASTS: FounderPodcast[] = [
  {
    id: 'pod-1',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: "The Founder's Journey: From Idea to Impact",
    channel_name: 'Ezeji Patrick Channel',
    video_url: 'https://www.youtube.com/watch?v=DrpZwdPNnIY',
    embed_url: 'https://www.youtube.com/embed/DrpZwdPNnIY',
    duration_display: '45:20',
    thumbnail_url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    recorded_at: '2025-01-28',
    created_at: '2025-01-28T18:00:00Z'
  },
  {
    id: 'pod-2',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'Tech, Talent and Opportunities in Nigeria',
    channel_name: 'Founders Forum',
    video_url: 'https://www.youtube.com/watch?v=DrpZwdPNnIY',
    embed_url: 'https://www.youtube.com/embed/DrpZwdPNnIY',
    duration_display: '38:17',
    thumbnail_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80',
    recorded_at: '2025-01-10',
    created_at: '2025-01-10T14:00:00Z'
  },
  {
    id: 'pod-3',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'Building Sustainable Digital Ecosystems in Emerging Markets',
    channel_name: 'Africa Tech Horizons',
    video_url: 'https://www.youtube.com/watch?v=DrpZwdPNnIY',
    embed_url: 'https://www.youtube.com/embed/DrpZwdPNnIY',
    duration_display: '52:10',
    thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    recorded_at: '2024-12-18',
    created_at: '2024-12-18T16:00:00Z'
  },
  {
    id: 'pod-4',
    founder_id: 'founder_ezeji_patrick_dsp',
    title: 'From Student to Tech Leader: How Vetting Unlocks Enterprise Trust',
    channel_name: 'Digital Campux Stories',
    video_url: 'https://www.youtube.com/watch?v=DrpZwdPNnIY',
    embed_url: 'https://www.youtube.com/embed/DrpZwdPNnIY',
    duration_display: '41:05',
    thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    recorded_at: '2024-11-20',
    created_at: '2024-11-20T11:00:00Z'
  }
];

export const INITIAL_TASKS: FounderTask[] = [
  {
    id: 'task-1',
    task_date: new Date().toISOString().split('T')[0],
    title: 'Review candidate vetting reports with DSP mentors',
    priority: 'high',
    estimated_minutes: 45,
    is_completed: true,
    completed_at: new Date().toISOString(),
    order_index: 1
  },
  {
    id: 'task-2',
    task_date: new Date().toISOString().split('T')[0],
    title: 'Draft weekly founder community newsletter and spotlight feature',
    priority: 'medium',
    estimated_minutes: 60,
    is_completed: true,
    completed_at: new Date().toISOString(),
    order_index: 2
  },
  {
    id: 'task-3',
    task_date: new Date().toISOString().split('T')[0],
    title: 'Record 15-minute Founder Stories recap snippet for YouTube',
    priority: 'high',
    estimated_minutes: 30,
    is_completed: true,
    completed_at: new Date().toISOString(),
    order_index: 3
  },
  {
    id: 'task-4',
    task_date: new Date().toISOString().split('T')[0],
    title: 'Coordinate sprint priorities with platform engineers',
    priority: 'medium',
    estimated_minutes: 30,
    is_completed: true,
    completed_at: new Date().toISOString(),
    order_index: 4
  },
  {
    id: 'task-5',
    task_date: new Date().toISOString().split('T')[0],
    title: 'Follow up with corporate training partner in Abuja',
    priority: 'urgent',
    estimated_minutes: 25,
    is_completed: false,
    completed_at: null,
    order_index: 5
  },
  {
    id: 'task-6',
    task_date: new Date().toISOString().split('T')[0],
    title: 'Finalize Q2 curriculum expansion roadmaps for SEO & Automation tracks',
    priority: 'medium',
    estimated_minutes: 50,
    is_completed: false,
    completed_at: null,
    order_index: 6
  }
];

export const INITIAL_DISTRACTIONS: FounderDistraction[] = [
  {
    id: 'dist-1',
    name: 'Excessive phone use',
    category: 'Digital',
    icon: '📱',
    description: 'Mindless phone checking and notifications during deep focus blocks',
    is_active_today: true
  },
  {
    id: 'dist-2',
    name: 'Social media scrolling',
    category: 'Digital',
    icon: '📸',
    description: 'Endless browsing on Twitter, LinkedIn or Instagram feeds',
    is_active_today: true
  },
  {
    id: 'dist-3',
    name: 'Oversleeping',
    category: 'Habits',
    icon: '😴',
    description: 'Sleeping past target morning start and losing peak morning momentum',
    is_active_today: true
  },
  {
    id: 'dist-4',
    name: 'Unnecessary conversations',
    category: 'Social',
    icon: '💬',
    description: 'Low-priority chats and informal calls that fracture cognitive flow',
    is_active_today: true
  },
  {
    id: 'dist-5',
    name: 'Context switching between apps',
    category: 'Productivity',
    icon: '🔄',
    description: 'Jumping between slack, email, and 20 open browser tabs',
    is_active_today: false
  },
  {
    id: 'dist-6',
    name: 'Premature optimization',
    category: 'Mindset',
    icon: '⚙️',
    description: 'Obsessing over tool stacks instead of customer conversations',
    is_active_today: false
  }
];

export const INITIAL_APPOINTMENTS: FounderAppointment[] = [
  {
    id: 'app-1',
    title: 'Founder Mentorship Session with Chinedu (EdTech MVP)',
    attendee_name: 'Chinedu Okeke',
    attendee_email: 'chinedu@edupath.ng',
    start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    end_time: new Date(Date.now() + 86400000 + 2700000).toISOString(),
    meeting_url: 'https://meet.google.com/dcp-dsp-fnd',
    status: 'upcoming',
    notes: 'Review go-to-market plan and feedback from first 10 pilot school leads.'
  },
  {
    id: 'app-2',
    title: 'Strategic Partnership Sync with Sterling Growth Capital',
    attendee_name: 'Marcus Sterling',
    attendee_email: 'recruiter@dsp.com',
    start_time: new Date(Date.now() + 172800000).toISOString(), // In 2 days
    end_time: new Date(Date.now() + 172800000 + 3600000).toISOString(),
    meeting_url: 'https://meet.google.com/stg-fnd-sync',
    status: 'upcoming',
    notes: 'Explore internship cohort placement and direct recruiter pipeline integration.'
  },
  {
    id: 'app-3',
    title: 'Founder Stories Pre-Interview Briefing with Amina',
    attendee_name: 'Amina Bello',
    attendee_email: 'amina@agrofresh.ng',
    start_time: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    end_time: new Date(Date.now() - 86400000 + 1800000).toISOString(),
    meeting_url: 'https://meet.google.com/fst-interview',
    status: 'completed',
    notes: 'Prepped talking points for YouTube interview recording.'
  }
];

export const INITIAL_OBJECTIVES: FounderObjective[] = [
  {
    id: 'obj-1',
    title: 'Expand DSP Academy Vetted Talent Placements by 40%',
    quarter_or_month: 'Q1 2025',
    year: 2025,
    status: 'in_progress',
    progress_percent: 68
  },
  {
    id: 'obj-2',
    title: 'Launch Founder Stories Podcast Season 2 & Reach 50,000 African Builders',
    quarter_or_month: 'Q1 2025',
    year: 2025,
    status: 'in_progress',
    progress_percent: 75
  }
];

export const INITIAL_KEY_RESULTS: FounderKeyResult[] = [
  {
    id: 'kr-1',
    objective_id: 'obj-1',
    title: 'Certify and vet 60 top-tier SEO and Automation specialists',
    target_value: 60,
    current_value: 44,
    unit: 'talents',
    weight: 2
  },
  {
    id: 'kr-2',
    objective_id: 'obj-1',
    title: 'Onboard 15 verified hiring recruiters to digital talent hub',
    target_value: 15,
    current_value: 11,
    unit: 'employers',
    weight: 1
  },
  {
    id: 'kr-3',
    objective_id: 'obj-2',
    title: 'Record and publish 8 in-depth founder video interviews',
    target_value: 8,
    current_value: 6,
    unit: 'episodes',
    weight: 2
  }
];

// Helper to get local storage store for the founder
function getFounderStore<T>(founderId: string, key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${FOUNDER_DATA_KEY_PREFIX}${founderId}_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Storage read failed:', e);
  }
  return fallback;
}

function setFounderStore<T>(founderId: string, key: string, val: T): void {
  try {
    localStorage.setItem(`${FOUNDER_DATA_KEY_PREFIX}${founderId}_${key}`, JSON.stringify(val));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }
}

/**
 * Primary Founder Dashboard Data Service
 * Resolves active profile, calculates authoritative counts from live records.
 */
export async function getFounderDashboardData(): Promise<{
  profile: FounderProfile;
  publishedArticles: FounderArticle[];
  draftArticles: FounderArticle[];
  podcasts: FounderPodcast[];
  dailyGoal: FounderDailyGoal;
  todayTasks: FounderTask[];
  distractions: FounderDistraction[];
  appointments: FounderAppointment[];
  objectives: FounderObjective[];
  keyResults: FounderKeyResult[];
  stats: {
    publishedArticlesCount: number;
    draftArticlesCount: number;
    podcastsCount: number;
    todayProgressPercent: number;
    completedTasksCount: number;
    totalTasksCount: number;
  };
}> {
  // 1. Resolve current active founder profile
  let profile = getCachedFounderProfile();
  if (!profile) {
    profile = DEFAULT_EZEJI_PROFILE;
    try {
      localStorage.setItem('dc_founder_profile', JSON.stringify(DEFAULT_EZEJI_PROFILE));
    } catch (_) {}
  }

  // Ensure headline, bio and avatar exist
  if (!profile.headline) profile.headline = DEFAULT_EZEJI_PROFILE.headline;
  if (!profile.bio) profile.bio = DEFAULT_EZEJI_PROFILE.bio;
  if (!profile.avatar_url) profile.avatar_url = DEFAULT_EZEJI_PROFILE.avatar_url;
  if (!profile.slug) profile.slug = profile.full_name ? profile.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'ezeji-patrick';

  const founderId = profile.id || DEFAULT_EZEJI_PROFILE.id;

  // 2. Fetch or load Published & Draft Articles
  let allArticles: FounderArticle[] = [];
  try {
    // Attempt Supabase query
    const { data, error } = await supabase
      .from('founder_articles')
      .select('*')
      .eq('founder_id', founderId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      allArticles = data as FounderArticle[];
    } else {
      // Local storage fallback
      const storedArticles = getFounderStore<FounderArticle[]>(
        founderId, 
        'articles', 
        [...INITIAL_PUBLISHED_ARTICLES, ...INITIAL_DRAFT_ARTICLES]
      );
      allArticles = storedArticles;
    }
  } catch {
    allArticles = getFounderStore<FounderArticle[]>(
      founderId, 
      'articles', 
      [...INITIAL_PUBLISHED_ARTICLES, ...INITIAL_DRAFT_ARTICLES]
    );
  }

  const publishedArticles = allArticles.filter(a => a.status === 'published');
  const draftArticles = allArticles.filter(a => a.status === 'draft');

  // 3. Fetch or load Podcasts
  let podcasts: FounderPodcast[] = [];
  try {
    const { data, error } = await supabase
      .from('founder_podcasts')
      .select('*')
      .eq('founder_id', founderId)
      .order('recorded_at', { ascending: false });

    if (!error && data && data.length > 0) {
      podcasts = data as FounderPodcast[];
    } else {
      podcasts = getFounderStore<FounderPodcast[]>(founderId, 'podcasts', INITIAL_PODCASTS);
    }
  } catch {
    podcasts = getFounderStore<FounderPodcast[]>(founderId, 'podcasts', INITIAL_PODCASTS);
  }

  // 4. Fetch or load Today's Tasks
  const todayStr = new Date().toISOString().split('T')[0];
  let todayTasks: FounderTask[] = [];
  try {
    const { data, error } = await supabase
      .from('founder_tasks')
      .select('*')
      .eq('founder_id', founderId)
      .eq('task_date', todayStr)
      .order('order_index', { ascending: true });

    if (!error && data && data.length > 0) {
      todayTasks = data as FounderTask[];
    } else {
      todayTasks = getFounderStore<FounderTask[]>(founderId, 'tasks', INITIAL_TASKS);
    }
  } catch {
    todayTasks = getFounderStore<FounderTask[]>(founderId, 'tasks', INITIAL_TASKS);
  }

  // 5. Fetch or load Daily Goal
  let dailyGoal: FounderDailyGoal = {
    id: `goal_${founderId}_${todayStr}`,
    founder_id: founderId,
    goal_date: todayStr,
    title: 'Make progress on content, partnerships and product development.',
    benchmark_percent: 80
  };
  try {
    const { data, error } = await supabase
      .from('founder_daily_goals')
      .select('*')
      .eq('founder_id', founderId)
      .eq('goal_date', todayStr)
      .maybeSingle();

    if (!error && data) {
      dailyGoal = data as FounderDailyGoal;
    } else {
      dailyGoal = getFounderStore<FounderDailyGoal>(founderId, 'daily_goal', dailyGoal);
    }
  } catch {
    dailyGoal = getFounderStore<FounderDailyGoal>(founderId, 'daily_goal', dailyGoal);
  }

  // 6. Fetch or load Distractions
  let distractions: FounderDistraction[] = [];
  try {
    distractions = getFounderStore<FounderDistraction[]>(founderId, 'distractions', INITIAL_DISTRACTIONS);
  } catch {
    distractions = INITIAL_DISTRACTIONS;
  }

  // 7. Fetch or load Appointments
  let appointments: FounderAppointment[] = [];
  try {
    const { data, error } = await supabase
      .from('founder_appointments')
      .select('*')
      .eq('founder_id', founderId)
      .order('start_time', { ascending: true });

    if (!error && data && data.length > 0) {
      appointments = data as FounderAppointment[];
    } else {
      appointments = getFounderStore<FounderAppointment[]>(founderId, 'appointments', INITIAL_APPOINTMENTS);
    }
  } catch {
    appointments = getFounderStore<FounderAppointment[]>(founderId, 'appointments', INITIAL_APPOINTMENTS);
  }

  // 8. Objectives & Key Results
  const objectives = getFounderStore<FounderObjective[]>(founderId, 'objectives', INITIAL_OBJECTIVES);
  const keyResults = getFounderStore<FounderKeyResult[]>(founderId, 'key_results', INITIAL_KEY_RESULTS);

  // 9. Authoritative calculation of task progress
  const totalTasksCount = todayTasks.length;
  const completedTasksCount = todayTasks.filter(t => t.is_completed).length;
  const todayProgressPercent = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  return {
    profile,
    publishedArticles,
    draftArticles,
    podcasts,
    dailyGoal,
    todayTasks,
    distractions,
    appointments,
    objectives,
    keyResults,
    stats: {
      publishedArticlesCount: publishedArticles.length,
      draftArticlesCount: draftArticles.length,
      podcastsCount: podcasts.length,
      todayProgressPercent,
      completedTasksCount,
      totalTasksCount
    }
  };
}

/**
 * Toggle task completed status
 */
export async function toggleTaskCompletion(taskId: string): Promise<FounderTask[]> {
  const profile = getCachedFounderProfile() || DEFAULT_EZEJI_PROFILE;
  const founderId = profile.id;
  const tasks = getFounderStore<FounderTask[]>(founderId, 'tasks', INITIAL_TASKS);

  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      const isNowCompleted = !task.is_completed;
      return {
        ...task,
        is_completed: isNowCompleted,
        completed_at: isNowCompleted ? new Date().toISOString() : null
      };
    }
    return task;
  });

  setFounderStore(founderId, 'tasks', updatedTasks);

  // Sync to Supabase in background
  try {
    const targetTask = updatedTasks.find(t => t.id === taskId);
    if (targetTask) {
      await supabase
        .from('founder_tasks')
        .update({
          is_completed: targetTask.is_completed,
          completed_at: targetTask.completed_at
        })
        .eq('id', taskId);
    }
  } catch (_) {}

  return updatedTasks;
}

/**
 * Add a new task for today
 */
export async function createFounderTask(
  title: string, 
  priority: 'low' | 'medium' | 'high' | 'urgent',
  estimatedMinutes: number = 30
): Promise<FounderTask[]> {
  const profile = getCachedFounderProfile() || DEFAULT_EZEJI_PROFILE;
  const founderId = profile.id;
  const tasks = getFounderStore<FounderTask[]>(founderId, 'tasks', INITIAL_TASKS);

  const newTask: FounderTask = {
    id: `task_${Date.now()}`,
    founder_id: founderId,
    task_date: new Date().toISOString().split('T')[0],
    title: title.trim(),
    priority,
    estimated_minutes: estimatedMinutes,
    is_completed: false,
    completed_at: null,
    order_index: tasks.length + 1,
    created_at: new Date().toISOString()
  };

  const updatedTasks = [...tasks, newTask];
  setFounderStore(founderId, 'tasks', updatedTasks);

  // Sync to Supabase
  try {
    await supabase.from('founder_tasks').insert([newTask]);
  } catch (_) {}

  return updatedTasks;
}

/**
 * Delete a task
 */
export async function deleteFounderTask(taskId: string): Promise<FounderTask[]> {
  const profile = getCachedFounderProfile() || DEFAULT_EZEJI_PROFILE;
  const founderId = profile.id;
  const tasks = getFounderStore<FounderTask[]>(founderId, 'tasks', INITIAL_TASKS);

  const updatedTasks = tasks.filter(t => t.id !== taskId);
  setFounderStore(founderId, 'tasks', updatedTasks);

  try {
    await supabase.from('founder_tasks').delete().eq('id', taskId);
  } catch (_) {}

  return updatedTasks;
}

/**
 * Save / Update Daily Goal
 */
export async function updateDailyGoal(title: string, benchmarkPercent: number = 80): Promise<FounderDailyGoal> {
  const profile = getCachedFounderProfile() || DEFAULT_EZEJI_PROFILE;
  const founderId = profile.id;
  const todayStr = new Date().toISOString().split('T')[0];

  const updatedGoal: FounderDailyGoal = {
    id: `goal_${founderId}_${todayStr}`,
    founder_id: founderId,
    goal_date: todayStr,
    title: title.trim(),
    benchmark_percent: benchmarkPercent
  };

  setFounderStore(founderId, 'daily_goal', updatedGoal);

  try {
    await supabase.from('founder_daily_goals').upsert([updatedGoal]);
  } catch (_) {}

  return updatedGoal;
}

/**
 * Create or save an Article
 */
export async function saveFounderArticle(article: Partial<FounderArticle>): Promise<FounderArticle> {
  const profile = getCachedFounderProfile() || DEFAULT_EZEJI_PROFILE;
  const founderId = profile.id;
  const currentArticles = getFounderStore<FounderArticle[]>(
    founderId, 
    'articles', 
    [...INITIAL_PUBLISHED_ARTICLES, ...INITIAL_DRAFT_ARTICLES]
  );

  const isNew = !article.id || !currentArticles.some(a => a.id === article.id);
  const now = new Date().toISOString();

  let savedArticle: FounderArticle;

  if (isNew) {
    const slug = (article.slug || article.title || 'article')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    savedArticle = {
      id: article.id || `art_${Date.now()}`,
      founder_id: founderId,
      title: article.title || 'Untitled Article',
      slug,
      excerpt: article.excerpt || '',
      content: article.content || '',
      cover_image_url: article.cover_image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
      reading_time_minutes: article.reading_time_minutes || 5,
      status: article.status || 'draft',
      views_count: 0,
      published_at: article.status === 'published' ? now : null,
      created_at: now,
      updated_at: now
    };
    currentArticles.unshift(savedArticle);
  } else {
    currentArticles.forEach((a, idx) => {
      if (a.id === article.id) {
        savedArticle = {
          ...a,
          ...article,
          published_at: article.status === 'published' && !a.published_at ? now : a.published_at,
          updated_at: now
        } as FounderArticle;
        currentArticles[idx] = savedArticle;
      }
    });
  }

  setFounderStore(founderId, 'articles', currentArticles);

  try {
    await supabase.from('founder_articles').upsert([savedArticle!]);
  } catch (_) {}

  return savedArticle!;
}

/**
 * Delete an Article
 */
export async function deleteFounderArticle(articleId: string): Promise<void> {
  const profile = getCachedFounderProfile() || DEFAULT_EZEJI_PROFILE;
  const founderId = profile.id;
  const currentArticles = getFounderStore<FounderArticle[]>(
    founderId, 
    'articles', 
    [...INITIAL_PUBLISHED_ARTICLES, ...INITIAL_DRAFT_ARTICLES]
  );

  const filtered = currentArticles.filter(a => a.id !== articleId);
  setFounderStore(founderId, 'articles', filtered);

  try {
    await supabase.from('founder_articles').delete().eq('id', articleId);
  } catch (_) {}
}

/**
 * Create a Podcast Session
 */
export async function saveFounderPodcast(data: {
  title: string;
  channel_name: string;
  video_url: string;
  duration_display?: string;
  thumbnail_url?: string;
  recorded_at?: string;
}): Promise<FounderPodcast> {
  const profile = getCachedFounderProfile() || DEFAULT_EZEJI_PROFILE;
  const founderId = profile.id;
  const currentPodcasts = getFounderStore<FounderPodcast[]>(founderId, 'podcasts', INITIAL_PODCASTS);

  // Extract YouTube ID if valid
  let embedUrl = data.video_url;
  const ytMatch = data.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  const newPodcast: FounderPodcast = {
    id: `pod_${Date.now()}`,
    founder_id: founderId,
    title: data.title.trim(),
    channel_name: data.channel_name.trim() || 'Digital Campux Stories',
    video_url: data.video_url.trim(),
    embed_url: embedUrl,
    duration_display: data.duration_display || '40:00',
    thumbnail_url: data.thumbnail_url || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    recorded_at: data.recorded_at || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  currentPodcasts.unshift(newPodcast);
  setFounderStore(founderId, 'podcasts', currentPodcasts);

  try {
    await supabase.from('founder_podcasts').insert([newPodcast]);
  } catch (_) {}

  return newPodcast;
}

/**
 * Delete a Podcast Session
 */
export async function deleteFounderPodcast(podcastId: string): Promise<void> {
  const profile = getCachedFounderProfile() || DEFAULT_EZEJI_PROFILE;
  const founderId = profile.id;
  const currentPodcasts = getFounderStore<FounderPodcast[]>(founderId, 'podcasts', INITIAL_PODCASTS);

  const filtered = currentPodcasts.filter(p => p.id !== podcastId);
  setFounderStore(founderId, 'podcasts', filtered);

  try {
    await supabase.from('founder_podcasts').delete().eq('id', podcastId);
  } catch (_) {}
}

/**
 * Toggle distraction for today
 */
export async function toggleDistractionSelection(distractionId: string): Promise<FounderDistraction[]> {
  const profile = getCachedFounderProfile() || DEFAULT_EZEJI_PROFILE;
  const founderId = profile.id;
  const distractions = getFounderStore<FounderDistraction[]>(founderId, 'distractions', INITIAL_DISTRACTIONS);

  const updated = distractions.map(d => {
    if (d.id === distractionId) {
      return { ...d, is_active_today: !d.is_active_today };
    }
    return d;
  });

  setFounderStore(founderId, 'distractions', updated);
  return updated;
}

/**
 * Add custom distraction to catalog
 */
export async function addCustomDistraction(name: string, category: 'Digital' | 'Habits' | 'Social' | 'Mindset' | 'Productivity', icon: string): Promise<FounderDistraction[]> {
  const profile = getCachedFounderProfile() || DEFAULT_EZEJI_PROFILE;
  const founderId = profile.id;
  const distractions = getFounderStore<FounderDistraction[]>(founderId, 'distractions', INITIAL_DISTRACTIONS);

  const newDist: FounderDistraction = {
    id: `dist_${Date.now()}`,
    name: name.trim(),
    category,
    icon: icon.trim() || '🛡️',
    description: 'Custom distraction guarded by founder',
    is_active_today: true
  };

  const updated = [...distractions, newDist];
  setFounderStore(founderId, 'distractions', updated);
  return updated;
}

/**
 * Schedule / Save Appointment
 */
export async function saveFounderAppointment(data: {
  title: string;
  attendee_name: string;
  attendee_email?: string;
  start_time: string;
  end_time?: string;
  meeting_url?: string;
  notes?: string;
}): Promise<FounderAppointment> {
  const profile = getCachedFounderProfile() || DEFAULT_EZEJI_PROFILE;
  const founderId = profile.id;
  const appointments = getFounderStore<FounderAppointment[]>(founderId, 'appointments', INITIAL_APPOINTMENTS);

  const newAppointment: FounderAppointment = {
    id: `app_${Date.now()}`,
    founder_id: founderId,
    title: data.title.trim(),
    attendee_name: data.attendee_name.trim(),
    attendee_email: data.attendee_email?.trim() || '',
    start_time: data.start_time,
    end_time: data.end_time || '',
    meeting_url: data.meeting_url?.trim() || 'https://meet.google.com/new',
    status: 'upcoming',
    notes: data.notes?.trim() || '',
    created_at: new Date().toISOString()
  };

  appointments.unshift(newAppointment);
  setFounderStore(founderId, 'appointments', appointments);

  try {
    await supabase.from('founder_appointments').insert([newAppointment]);
  } catch (_) {}

  return newAppointment;
}

/**
 * Update Appointment Status
 */
export async function updateAppointmentStatus(appointmentId: string, status: 'upcoming' | 'completed' | 'cancelled'): Promise<FounderAppointment[]> {
  const profile = getCachedFounderProfile() || DEFAULT_EZEJI_PROFILE;
  const founderId = profile.id;
  const appointments = getFounderStore<FounderAppointment[]>(founderId, 'appointments', INITIAL_APPOINTMENTS);

  const updated = appointments.map(a => {
    if (a.id === appointmentId) {
      return { ...a, status };
    }
    return a;
  });

  setFounderStore(founderId, 'appointments', updated);

  try {
    await supabase.from('founder_appointments').update({ status }).eq('id', appointmentId);
  } catch (_) {}

  return updated;
}

/**
 * Update Founder Profile Details
 */
export async function updateFounderProfileData(updates: Partial<FounderProfile>): Promise<FounderProfile> {
  const current = getCachedFounderProfile() || DEFAULT_EZEJI_PROFILE;
  const updated: FounderProfile = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString()
  };

  try {
    localStorage.setItem('dc_founder_profile', JSON.stringify(updated));
  } catch (_) {}

  // Attempt backend/supabase update
  try {
    await supabase
      .from('founder_profiles')
      .update({
        full_name: updated.full_name,
        headline: updated.headline,
        bio: updated.bio,
        website: updated.website,
        business_name: updated.business_name,
        location: updated.location
      })
      .eq('id', updated.id);
  } catch (_) {}

  return updated;
}
