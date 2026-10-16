export interface SocialLink {
  id: string;
  platform: 'GitHub' | 'LinkedIn' | 'Instagram' | 'Facebook' | 'YouTube' | 'X' | 'Custom';
  label: string;
  url: string;
  isEnabled: boolean;
  order: number;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Cloud & DevOps' | 'Design & Architecture' | 'Tools';
  proficiency: number; // 0 - 100
  order: number;
  isVisible: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  longDescription?: string;
  thumbnail: string;
  galleryImages: string[];
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  isFeatured: boolean;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string;
  order: number;
}

export interface CareerGoalItem {
  id: string;
  goal: string;
  timeframe: string;
  isCompleted: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
  ipAddress?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  adminName: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  order: number;
  isVisible: boolean;
}

export interface WebsiteSettings {
  siteTitle: string;
  siteDescription: string;
  primaryColor: string;
  accentColor: string;
  themeMode: 'dark' | 'light' | 'system';
  maintenanceMode: boolean;
  previewToken: string;
  resumeUrl: string;
  allowResumeDownload: boolean;
  contactEmail: string;
}

export interface HeaderFooterConfig {
  brandName: string;
  logoUrl?: string;
  navItems: NavItem[];
  footerText: string;
  copyrightText: string;
  showSocialInFooter: boolean;
}

export interface HomeContent {
  name: string;
  title: string;
  subtitle: string;
  intro: string;
  profilePhotoUrl: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  showStats: boolean;
  stats: Array<{ label: string; value: string; subtext: string }>;
  isPublished: boolean;
}

export interface AboutContent {
  bioTitle: string;
  bioParagraphs: string[];
  profilePhotoUrl: string;
  resumeUrl: string;
  resumeButtonText: string;
  showResume: boolean;
  interests: string[];
  education: EducationItem[];
  careerGoals: CareerGoalItem[];
  isPublished: boolean;
}

export interface AdminProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export interface ModularSection {
  id: string;
  name: string;
  slug: string;
  isEnabled: boolean;
  order: number;
  description: string;
}

export interface PortfolioData {
  settings: WebsiteSettings;
  headerFooter: HeaderFooterConfig;
  home: HomeContent;
  about: AboutContent;
  skills: SkillItem[];
  projects: ProjectItem[];
  socialLinks: SocialLink[];
  contactMessages: ContactMessage[];
  mediaLibrary: MediaAsset[];
  adminProfile: AdminProfile;
  adminPasswordHash: string; // or password
  activityLogs: ActivityLog[];
  modularSections: ModularSection[];
}

export interface PublicPortfolioData {
  settings: WebsiteSettings;
  headerFooter: HeaderFooterConfig;
  home: HomeContent;
  about: AboutContent;
  skills: SkillItem[];
  projects: ProjectItem[];
  socialLinks: SocialLink[];
  modularSections: ModularSection[];
}
