import fs from 'fs';
import path from 'path';
import type { PortfolioData } from '../src/types/portfolio.ts';

const BUNDLED_DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_DIR = BUNDLED_DATA_DIR;
const DB_FILE = path.join(DATA_DIR, 'portfolio_db.json');

export const INITIAL_DATA: PortfolioData = {
  settings: {
    siteTitle: 'Personal Portfolio',
    siteDescription: 'Professional portfolio and showcase of engineering projects.',
    primaryColor: '#6366f1',
    accentColor: '#38bdf8',
    themeMode: 'dark',
    maintenanceMode: false,
    maintenanceMessage: 'The portfolio is currently undergoing scheduled updates and will be available shortly.',
    previewToken: 'preview_portfolio_access',
    resumeUrl: '',
    allowResumeDownload: false,
    contactEmail: '',
  },
  headerFooter: {
    brandName: 'Portfolio',
    logoUrl: '',
    navItems: [
      { id: 'nav-home', label: 'Home', href: '#home', order: 1, isVisible: true },
      { id: 'nav-about', label: 'About', href: '#about', order: 2, isVisible: true },
      { id: 'nav-work', label: 'Work', href: '#work', order: 3, isVisible: true },
      { id: 'nav-contact', label: 'Contact', href: '#contact', order: 4, isVisible: true },
    ],
    footerText: '',
    copyrightText: '',
    showSocialInFooter: true,
  },
  home: {
    name: '',
    title: '',
    subtitle: '',
    intro: '',
    profilePhotoUrl: '',
    primaryCtaText: 'View My Work',
    primaryCtaLink: '#work',
    secondaryCtaText: 'Contact Me',
    secondaryCtaLink: '#contact',
    showStats: false,
    stats: [],
    isPublished: false,
  },
  about: {
    bioTitle: '',
    bioParagraphs: [],
    profilePhotoUrl: '',
    resumeUrl: '',
    resumeButtonText: 'Download Resume',
    showResume: false,
    interests: [],
    education: [],
    careerGoals: [],
    isPublished: false,
  },
  skills: [],
  projects: [],
  education: [],
  experience: [],
  certifications: [],
  achievements: [],
  services: [],
  resume: {
    url: '',
    fileName: '',
    lastUpdated: '',
    allowDownload: false,
    totalDownloads: 0,
    downloadLogs: [],
  },
  blog: [],
  testimonials: [],
  faq: [],
  customPages: [],
  socialLinks: [],
  contactMessages: [],
  newsletterSubscribers: [],
  mediaLibrary: [],
  seoMetadata: {
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    author: '',
    ogImage: '',
    canonicalUrl: '',
    twitterHandle: '',
  },
  notificationSettings: {
    emailAlerts: true,
    notifyOnNewMessage: true,
    notifyOnResumeDownload: false,
    notificationEmail: '',
  },
  analytics: {
    pageViews: 0,
    uniqueVisitors: 0,
    sectionViews: {},
    dailyVisits: [],
  },
  githubActivity: {
    username: '',
    totalRepos: 0,
    publicGists: 0,
    followers: 0,
    contributionsThisYear: 0,
    topLanguages: [],
    recentRepos: [],
  },
  adminProfile: {
    name: 'Administrator',
    email: 'admin@portfolio.local',
    role: 'Super Administrator',
    avatarUrl: '',
    lastLogin: new Date().toISOString(),
  },
  adminPasswordHash: '782447',
  activityLogs: [],
  modularSections: [
    { id: 'sec-home', name: 'Home / Hero', slug: 'home', isEnabled: true, order: 1, description: 'Hero banner, introduction, calls to action, and quick KPI metrics' },
    { id: 'sec-about', name: 'About & Bio', slug: 'about', isEnabled: true, order: 2, description: 'Biography, workspace media, career goals, and personal interests' },
    { id: 'sec-work', name: 'Work & Projects', slug: 'work', isEnabled: true, order: 3, description: 'Project portfolio showcase cards, tech stacks, and live links' },
    { id: 'sec-experience', name: 'Experience & History', slug: 'experience', isEnabled: true, order: 4, description: 'Work history timeline, company roles, and bullet achievements' },
    { id: 'sec-skills', name: 'Skills & Technologies', slug: 'skills', isEnabled: true, order: 5, description: 'Categorized technical proficiencies, frameworks, and tools' },
    { id: 'sec-education', name: 'Education & Academics', slug: 'education', isEnabled: true, order: 6, description: 'Academic degrees, institutions, years, and descriptions' },
    { id: 'sec-certifications', name: 'Certifications', slug: 'certifications', isEnabled: true, order: 7, description: 'Professional cloud and engineering certifications with credentials' },
    { id: 'sec-achievements', name: 'Achievements & Awards', slug: 'achievements', isEnabled: true, order: 8, description: 'Industry honors, patents, and technical recognitions' },
    { id: 'sec-services', name: 'Services & Consulting', slug: 'services', isEnabled: true, order: 9, description: 'Consulting packages, architecture review, and advisory options' },
    { id: 'sec-testimonials', name: 'Testimonials', slug: 'testimonials', isEnabled: true, order: 10, description: 'Executive references, client reviews, and peer endorsements' },
    { id: 'sec-blog', name: 'Articles & Tech Insights', slug: 'blog', isEnabled: true, order: 11, description: 'Technical deep-dives and engineering monographs' },
    { id: 'sec-github', name: 'GitHub & Activity', slug: 'github', isEnabled: true, order: 12, description: 'Open-source activity, repository statistics, and contribution metrics' },
    { id: 'sec-resume', name: 'Resume Download', slug: 'resume', isEnabled: true, order: 13, description: 'Direct CV download card with live analytics tracking' },
    { id: 'sec-faq', name: 'FAQ Section', slug: 'faq', isEnabled: true, order: 14, description: 'Frequently asked questions with category filtering' },
    { id: 'sec-contact', name: 'Contact & Inquiries', slug: 'contact', isEnabled: true, order: 15, description: 'Secure inquiry form, direct email, and social connectivity' },
  ]
};

// Ensure data folder exists safely
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create data directory, fallback to in-memory persistence:', e);
}

export class PortfolioDatabase {
  private static instance: PortfolioDatabase;
  private cache: PortfolioData | null = null;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): PortfolioDatabase {
    if (!PortfolioDatabase.instance) {
      PortfolioDatabase.instance = new PortfolioDatabase();
    }
    return PortfolioDatabase.instance;
  }

  private ensureInitialized(): void {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const existingData = JSON.parse(raw);
        // Merge existing data with defaults to ensure structural integrity
        const merged = this.mergeWithDefaults(existingData, INITIAL_DATA);
        this.cache = merged;
        this.saveData(merged);
        return;
      } catch (err) {
        console.error('Error reading existing DB file, falling back to initial data:', err);
      }
    }
    this.saveData(INITIAL_DATA);
  }

  private mergeWithDefaults(existing: any, defaults: PortfolioData): PortfolioData {
    const result = { ...defaults };
    if (!existing || typeof existing !== 'object') return result;

    for (const key of Object.keys(defaults) as (keyof PortfolioData)[]) {
      if (existing[key] !== undefined && existing[key] !== null) {
        if (Array.isArray(defaults[key])) {
          // If existing is an array, preserve existing array
          result[key] = (Array.isArray(existing[key]) ? existing[key] : defaults[key]) as any;
        } else if (typeof defaults[key] === 'object') {
          result[key] = {
            ...(defaults[key] as any),
            ...(existing[key] as any),
          };
        } else {
          result[key] = existing[key];
        }
      }
    }

    return result;
  }

  public getData(): PortfolioData {
    if (this.cache) {
      return this.cache;
    }
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.cache = JSON.parse(raw);
        return this.cache!;
      }
    } catch (err) {
      console.error('Error reading portfolio DB:', err);
    }
    this.saveData(INITIAL_DATA);
    return INITIAL_DATA;
  }

  public saveData(data: PortfolioData): void {
    this.cache = data;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      try {
        fs.renameSync(tmpFile, DB_FILE);
      } catch {
        fs.copyFileSync(tmpFile, DB_FILE);
        try { fs.unlinkSync(tmpFile); } catch {}
      }
    } catch (err) {
      console.warn('Filesystem write warning, state preserved in memory:', err);
    }
  }

  public logActivity(action: string, details: string, adminName = 'Admin'): void {
    const data = this.getData();
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      adminName,
    };
    if (!data.activityLogs) data.activityLogs = [];
    data.activityLogs.unshift(newLog);
    if (data.activityLogs.length > 250) {
      data.activityLogs = data.activityLogs.slice(0, 250);
    }
    this.saveData(data);
  }
}

export const db = PortfolioDatabase.getInstance();
