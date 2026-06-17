export interface Skill {
  name: string;
  level: 'Expert' | 'Advanced' | 'Intermediate';
}

export interface ProjectData {
  title: string;
  description: string;
  metrics: string;
  tools: string[];
  year: string;
}

export interface CaseStudy {
  title: string;
  problem: string;
  solution: string;
  results: string;
}

export interface Recommendation {
  author: string;
  role: string;
  company: string;
  avatar: string;
  text: string;
}

export interface TalentCandidate {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  specialization: 'SEO' | 'Social Media' | 'Email Marketing' | 'Growth Marketing' | 'PPC' | 'AI Automation';
  verificationBadge: 'Verified Intern' | 'Verified Professional' | 'Internship Graduate' | 'Top Performer';
  skills: string[];
  availability: 'Available Immediately' | 'Interviews Open' | 'Onboard in 1 Week' | 'In Placement';
  portfolioScore: number;
  featuredProject: {
    title: string;
    metrics: string;
  };
  experienceCount: number;
  bio: string;
  location: string;
  email: string;
  phone: string;
  about: string;
  projects?: ProjectData[];
  caseStudies?: CaseStudy[];
  certifications?: string[];
  recommendations?: Recommendation[];
}

export interface BadgeExplanation {
  id: string;
  name: string;
  iconName: string;
  tagline: string;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export interface StepInfo {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  details: string[];
}
