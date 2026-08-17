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

export interface CaseStudyItem {
  id?: string;
  title: string;
  metric?: string;
  metrics?: string;
  description: string;
  tech_stack?: string[];
  techStack?: string[];
  tools?: string[];
  link?: string;
}

export interface WorkHistoryItem {
  id?: string;
  role?: string;
  title?: string;
  company: string;
  startDate?: string;
  endDate?: string;
  dates?: string;
  location?: string;
  bullets?: string[];
  highlights?: string[];
}

export interface EducationItem {
  id?: string;
  degree: string;
  institution: string;
  year: string;
  honors?: string;
  details?: string;
}

export interface CertificationItem {
  id?: string;
  name: string;
  issuer?: string;
  year?: string;
}

export interface TalentCandidate {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  specialization: 'SEO' | 'Social Media' | 'Email Marketing' | 'Growth Marketing' | 'PPC' | 'AI Automation' | 'Full-Stack Developer' | string;
  verificationBadge: 'Verified Intern' | 'Verified Professional' | 'Internship Graduate' | 'Top Performer';
  isVerified?: boolean;
  skills: string[];
  aiTools?: string[];
  headline?: string;
  hourlyRate?: string | number;
  monthlyRetainer?: string | number;
  availability: 'Available Immediately' | 'Interviews Open' | 'Onboard in 1 Week' | 'In Placement';
  availability_status?: 'available' | 'hired';
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
  slug?: string;
  profilePictureUrl?: string;
  projects?: ProjectData[];
  caseStudies?: CaseStudy[];
  case_studies?: CaseStudyItem[];
  work_history?: WorkHistoryItem[];
  education?: EducationItem[];
  certifications?: string[];
  recommendations?: Recommendation[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  twitterUrl?: string;
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

export type PageType = 
  | 'home' 
  | 'directory' 
  | 'employer' 
  | 'talent' 
  | 'assessment' 
  | 'pricing' 
  | 'admin' 
  | 'admin-login'
  | 'recruiter-signup'
  | 'recruiter-login'
  | 'recruiter-dashboard';

