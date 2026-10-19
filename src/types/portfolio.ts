export type PublishStatus = 'draft' | 'published' | 'unpublished';

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
  isPublished: boolean;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  period: string;
  description: string;
  achievements: string[];
  isCurrent: boolean;
  isPublished: boolean;
  order: number;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  badgeImage?: string;
  isPublished: boolean;
  order: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
  badgeIcon?: string;
  url?: string;
  isPublished: boolean;
  order: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  deliverables: string[];
  pricing?: string;
  isPublished: boolean;
  order: number;
}

export interface CareerGoalItem {
  id: string;
  goal: string;
  timeframe: string;
  isCompleted: boolean;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  clientRole: string;
  clientCompany: string;
  avatarUrl?: string;
  content: string;
  rating: number; // 1-5
  isPublished: boolean;
  order: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  publishedAt: string;
  readTimeMinutes: number;
  isPublished: boolean;
  order: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPublished: boolean;
  order: number;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  updatedAt: string;
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

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export interface MediaAsset {
  id: string;
  name: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  dataBase64?: string; // Permanent in-database backup for serverless/cold-start environments
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
  maintenanceMessage?: string;
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

export interface ResumeManagement {
  url: string;
  fileName: string;
  lastUpdated: string;
  allowDownload: boolean;
  totalDownloads: number;
  downloadLogs: Array<{ id: string; timestamp: string; ip?: string }>;
}

export interface SeoMetadata {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  author: string;
  ogImage?: string;
  canonicalUrl?: string;
  twitterHandle?: string;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  notifyOnNewMessage: boolean;
  notifyOnResumeDownload: boolean;
  notificationEmail: string;
}

export interface AnalyticsRecord {
  pageViews: number;
  uniqueVisitors: number;
  sectionViews: Record<string, number>;
  dailyVisits: Array<{ date: string; views: number }>;
}

export interface GithubActivity {
  username: string;
  totalRepos: number;
  publicGists: number;
  followers: number;
  contributionsThisYear: number;
  topLanguages: Array<{ name: string; percentage: number }>;
  recentRepos: Array<{ name: string; stars: number; forks: number; description: string; url: string; language: string }>;
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
  education: EducationItem[];
  experience: ExperienceItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  services: ServiceItem[];
  resume: ResumeManagement;
  blog: BlogPost[];
  testimonials: TestimonialItem[];
  faq: FaqItem[];
  customPages: CustomPage[];
  socialLinks: SocialLink[];
  contactMessages: ContactMessage[];
  newsletterSubscribers: NewsletterSubscriber[];
  mediaLibrary: MediaAsset[];
  seoMetadata: SeoMetadata;
  notificationSettings: NotificationSettings;
  analytics: AnalyticsRecord;
  githubActivity: GithubActivity;
  adminProfile: AdminProfile;
  adminPasswordHash: string;
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
  education: EducationItem[];
  experience: ExperienceItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  services: ServiceItem[];
  resume: ResumeManagement;
  blog: BlogPost[];
  testimonials: TestimonialItem[];
  faq: FaqItem[];
  socialLinks: SocialLink[];
  customPages: CustomPage[];
  githubActivity: GithubActivity;
  seoMetadata: SeoMetadata;
  modularSections: ModularSection[];
}
