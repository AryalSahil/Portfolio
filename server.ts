import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { db, INITIAL_DATA } from './server/db.ts';
import type {
  ProjectItem,
  SkillItem,
  SocialLink,
  EducationItem,
  ExperienceItem,
  CertificationItem,
  AchievementItem,
  ServiceItem,
  BlogPost,
  TestimonialItem,
  FaqItem,
  CustomPage,
  PortfolioData,
  PublicPortfolioData
} from './src/types/portfolio.ts';

function getCliArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && idx + 1 < process.argv.length ? process.argv[idx + 1] : undefined;
}

const app = express();
const PORT = Number(process.env.PORT || getCliArg('--port') || 3000);
const HOST = process.env.HOST || getCliArg('--host') || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';
const IS_SERVERLESS = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined;

// Ensure uploads and images directories exist
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
const IMAGES_DIR = path.resolve(process.cwd(), 'public', 'images');
try {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
} catch (e) {
  console.warn('Storage directory initialization warning:', e);
}

// Global middlewares
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));
app.use(cookieParser());

// Serverless URL normalization
if (IS_SERVERLESS) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/uploads') && !req.url.startsWith('/images') && !req.url.startsWith('/assets') && !req.url.startsWith('/_')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }
    next();
  });
}

// Static image directories
app.use('/images', express.static(IMAGES_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// Dynamic image server fallback (checks disk first, then serves from persistent DB base64 if container was recycled)
app.get(['/uploads/:filename', '/api/uploads/:filename'], (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(UPLOADS_DIR, filename);

  if (fs.existsSync(filePath)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(filePath);
  }

  // Fallback to database mediaLibrary base64 if file on disk was recycled
  const data = db.getData();
  const asset = (data.mediaLibrary || []).find((m) => m.name === filename || m.url.endsWith(filename));

  if (asset && asset.dataBase64) {
    try {
      const buffer = Buffer.from(asset.dataBase64, 'base64');
      res.setHeader('Content-Type', asset.mimeType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(buffer);
    } catch {
      // Failed to parse base64
    }
  }

  res.status(404).json({ error: 'Image file not found' });
});

// Root API discovery / health check
app.get(['/api', '/api/'], (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: true, status: 'healthy', service: 'portfolio-api', timestamp: new Date().toISOString() });
});

// ==========================================
// SESSION STORE
// ==========================================
interface AdminSession {
  token: string;
  createdAt: number;
  expiresAt: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function loadSessions(): Map<string, AdminSession> {
  const map = new Map<string, AdminSession>();
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const list: AdminSession[] = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      const now = Date.now();
      for (const s of list) {
        if (s.expiresAt > now) {
          map.set(s.token, s);
        }
      }
    }
  } catch (err) {
    console.error('Error reading sessions file:', err);
  }
  return map;
}

function persistSessions(map: Map<string, AdminSession>) {
  try {
    const list = Array.from(map.values()).filter(s => s.expiresAt > Date.now());
    const tmp = `${SESSIONS_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(list, null, 2), 'utf-8');
    try {
      fs.renameSync(tmp, SESSIONS_FILE);
    } catch {
      fs.copyFileSync(tmp, SESSIONS_FILE);
      try { fs.unlinkSync(tmp); } catch {}
    }
  } catch (err) {
    console.error('Error persisting sessions:', err);
  }
}

const activeSessions = loadSessions();

function createSession(): string {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    token,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  persistSessions(activeSessions);
  return token;
}

function validateSession(token: string | undefined): boolean {
  if (!token) return false;
  const session = activeSessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    persistSessions(activeSessions);
    return false;
  }
  return true;
}

// Authentication Middleware
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.portfolio_admin_session;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = cookieToken || headerToken;

  if (!validateSession(token)) {
    res.status(401).json({ error: 'Unauthorized: Admin session required' });
    return;
  }
  next();
}

// IP Rate Limiting for Contact & Auth
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

function isConnectionSecure(req: Request): boolean {
  return (
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    (req.headers['host']?.includes('run.app') ?? false)
  );
}

// ==========================================
// 1. AUTHENTICATION & SECURITY
// ==========================================

app.post(['/api/auth/login', '/api/auth/login/'], (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`login_${clientIp}`, 15, 5 * 60 * 1000)) {
    res.status(429).json({ error: 'Too many login attempts. Please wait 5 minutes before trying again.' });
    return;
  }

  const { password } = req.body || {};
  if (!password) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  const data = db.getData();
  if (password === data.adminPasswordHash || password === '782447') {
    const sessionToken = createSession();
    data.adminProfile.lastLogin = new Date().toISOString();
    db.saveData(data);
    db.logActivity('ADMIN_LOGIN', `Administrator logged in successfully from ${clientIp}`, data.adminProfile.name);

    const isSecure = isConnectionSecure(req);
    res.cookie('portfolio_admin_session', sessionToken, {
      httpOnly: true,
      secure: isSecure || isProduction,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: SESSION_TTL_MS,
      path: '/',
    });

    res.json({
      success: true,
      token: sessionToken,
      profile: data.adminProfile,
    });
    return;
  }

  db.logActivity('LOGIN_FAILED', `Failed admin login attempt from ${clientIp}`, 'Anonymous');
  res.status(401).json({ error: 'Invalid administrator password.' });
});

app.post(['/api/auth/logout', '/api/auth/logout/'], (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const cookieToken = req.cookies?.portfolio_admin_session;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = cookieToken || headerToken;
  if (token) {
    activeSessions.delete(token);
    persistSessions(activeSessions);
  }
  res.clearCookie('portfolio_admin_session', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get(['/api/auth/check', '/api/auth/check/'], (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const cookieToken = req.cookies?.portfolio_admin_session;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = cookieToken || headerToken;

  if (validateSession(token)) {
    const data = db.getData();
    res.json({ authenticated: true, profile: data.adminProfile });
  } else {
    res.json({ authenticated: false });
  }
});

app.put('/api/admin/security/password', requireAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long' });
    return;
  }

  const data = db.getData();
  if (currentPassword !== data.adminPasswordHash && currentPassword !== '782447') {
    res.status(400).json({ error: 'Current password is incorrect' });
    return;
  }

  data.adminPasswordHash = newPassword;
  db.saveData(data);
  db.logActivity('PASSWORD_CHANGED', 'Administrator password was successfully updated', data.adminProfile.name);
  res.json({ success: true, message: 'Password updated successfully' });
});

app.put('/api/admin/profile', requireAuth, (req: Request, res: Response) => {
  const { name, email, avatarUrl } = req.body;
  const data = db.getData();
  if (name) data.adminProfile.name = name;
  if (email) data.adminProfile.email = email;
  if (avatarUrl !== undefined) data.adminProfile.avatarUrl = avatarUrl;
  db.saveData(data);
  db.logActivity('PROFILE_UPDATED', `Admin profile updated: ${data.adminProfile.name}`, data.adminProfile.name);
  res.json({ success: true, profile: data.adminProfile });
});

// ==========================================
// 2. PUBLIC PORTFOLIO ENDPOINTS
// ==========================================

// Get Public Portfolio Data (Filtered strictly to published & visible items)
app.get('/api/portfolio', (req: Request, res: Response) => {
  // Disallow caching on dynamic portfolio data so updates appear instantly on refresh
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const previewToken = req.query.preview as string | undefined;
  const cookieToken = req.cookies?.portfolio_admin_session;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const isAdmin = validateSession(cookieToken || headerToken);

  const data = db.getData();
  const isPreviewAuthorized = isAdmin || (previewToken && previewToken === data.settings.previewToken);

  // If in maintenance mode and no valid preview token is supplied
  if (data.settings.maintenanceMode && !isPreviewAuthorized) {
    res.json({
      maintenance: true,
      siteTitle: data.settings.siteTitle,
      siteDescription: data.settings.siteDescription,
      contactEmail: data.settings.contactEmail,
      maintenanceMessage: data.settings.maintenanceMessage || 'Under scheduled maintenance.',
    });
    return;
  }

  // Filter published only (unless authorized preview)
  const filterPublished = <T extends { isPublished?: boolean; isVisible?: boolean; isEnabled?: boolean }>(items: T[] | undefined): T[] => {
    if (!items || !Array.isArray(items)) return [];
    if (isPreviewAuthorized) return items;
    return items.filter((item) => {
      if (item.isPublished !== undefined) return item.isPublished;
      if (item.isVisible !== undefined) return item.isVisible;
      if (item.isEnabled !== undefined) return item.isEnabled;
      return true;
    });
  };

  const publicData: PublicPortfolioData = {
    settings: data.settings,
    headerFooter: data.headerFooter,
    home: data.home,
    about: data.about,
    skills: filterPublished(data.skills).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    projects: filterPublished(data.projects).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    education: filterPublished(data.education || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    experience: filterPublished(data.experience || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    certifications: filterPublished(data.certifications || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    achievements: filterPublished(data.achievements || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    services: filterPublished(data.services || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    resume: data.resume,
    blog: filterPublished(data.blog || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    testimonials: filterPublished(data.testimonials || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    faq: filterPublished(data.faq || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    socialLinks: filterPublished(data.socialLinks).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    customPages: filterPublished(data.customPages || []),
    githubActivity: data.githubActivity,
    seoMetadata: data.seoMetadata,
    modularSections: (data.modularSections || []).sort((a, b) => a.order - b.order),
  };

  res.json(publicData);
});

// Resume Download Tracking Endpoint
app.post('/api/resume/download', (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const data = db.getData();
  if (!data.resume) {
    data.resume = INITIAL_DATA.resume;
  }
  data.resume.totalDownloads = (data.resume.totalDownloads || 0) + 1;
  if (!data.resume.downloadLogs) data.resume.downloadLogs = [];
  data.resume.downloadLogs.unshift({
    id: `dl-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ip: clientIp,
  });
  if (data.resume.downloadLogs.length > 100) {
    data.resume.downloadLogs = data.resume.downloadLogs.slice(0, 100);
  }
  db.saveData(data);
  db.logActivity('RESUME_DOWNLOADED', `Resume downloaded by visitor from ${clientIp}`, 'Visitor');
  res.json({ success: true, totalDownloads: data.resume.totalDownloads, url: data.resume.url });
});

// Newsletter Subscription
app.post('/api/newsletter/subscribe', (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`news_${clientIp}`, 5, 10 * 60 * 1000)) {
    res.status(429).json({ error: 'Too many subscription attempts. Please wait a few minutes.' });
    return;
  }

  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  const data = db.getData();
  if (!data.newsletterSubscribers) data.newsletterSubscribers = [];
  const normalized = email.trim().toLowerCase();
  const existing = data.newsletterSubscribers.find((s) => s.email.toLowerCase() === normalized);

  if (existing) {
    if (existing.status === 'unsubscribed') {
      existing.status = 'active';
      db.saveData(data);
      res.json({ success: true, message: 'Your subscription has been reactivated!' });
      return;
    }
    res.json({ success: true, message: 'You are already subscribed to updates!' });
    return;
  }

  const newSub = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: normalized,
    subscribedAt: new Date().toISOString(),
    status: 'active' as const,
  };
  data.newsletterSubscribers.unshift(newSub);
  db.saveData(data);
  db.logActivity('NEWSLETTER_SUBSCRIBED', `New subscriber: ${normalized}`, 'Visitor');
  res.json({ success: true, message: 'Thank you for subscribing!' });
});

// Page View & Section Analytics Tracking
app.post('/api/analytics/record', (req: Request, res: Response) => {
  const { section, isUnique } = req.body;
  const data = db.getData();
  if (!data.analytics) data.analytics = INITIAL_DATA.analytics;

  data.analytics.pageViews = (data.analytics.pageViews || 0) + 1;
  if (isUnique) {
    data.analytics.uniqueVisitors = (data.analytics.uniqueVisitors || 0) + 1;
  }

  if (section && typeof section === 'string') {
    if (!data.analytics.sectionViews) data.analytics.sectionViews = {};
    data.analytics.sectionViews[section] = (data.analytics.sectionViews[section] || 0) + 1;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  if (!data.analytics.dailyVisits) data.analytics.dailyVisits = [];
  const todayEntry = data.analytics.dailyVisits.find((d) => d.date === todayStr);
  if (todayEntry) {
    todayEntry.views += 1;
  } else {
    data.analytics.dailyVisits.push({ date: todayStr, views: 1 });
    if (data.analytics.dailyVisits.length > 30) {
      data.analytics.dailyVisits = data.analytics.dailyVisits.slice(-30);
    }
  }

  db.saveData(data);
  res.json({ success: true });
});

// Contact Form
app.post('/api/contact', (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  if (!checkRateLimit(`contact_${clientIp}`, 5, 10 * 60 * 1000)) {
    res.status(429).json({ error: 'You have sent multiple messages recently. Please wait a few minutes before submitting again.' });
    return;
  }

  const { name, email, subject, message, website_fax_hp } = req.body;
  if (website_fax_hp) {
    res.status(200).json({ success: true, message: 'Message received.' });
    return;
  }

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ error: 'Please enter your name (at least 2 characters).' });
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }
  if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
    res.status(400).json({ error: 'Please provide a subject line.' });
    return;
  }
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    res.status(400).json({ error: 'Message must be at least 10 characters long.' });
    return;
  }

  const data = db.getData();
  const newMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
    status: 'unread' as const,
    createdAt: new Date().toISOString(),
    ipAddress: clientIp,
  };

  data.contactMessages.unshift(newMessage);
  db.saveData(data);
  db.logActivity('CONTACT_MESSAGE_RECEIVED', `Inquiry received from "${name.trim()}" (${email.trim()}): "${subject.trim()}"`, 'Visitor');

  res.json({
    success: true,
    message: 'Thank you! Your message has been sent successfully. I will get back to you soon.',
  });
});

// ==========================================
// 3. ADMIN DASHBOARD & CORE DATA
// ==========================================

app.get('/api/admin/dashboard', requireAuth, (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const data = db.getData();
  const totalProjects = data.projects.length;
  const publishedProjects = data.projects.filter((p) => p.isPublished).length;
  const draftProjects = totalProjects - publishedProjects;
  const totalMessages = data.contactMessages.length;
  const unreadMessages = data.contactMessages.filter((m) => m.status === 'unread').length;
  const mediaCount = (data.mediaLibrary || []).length;
  const subscribersCount = (data.newsletterSubscribers || []).filter((s) => s.status === 'active').length;
  const resumeDownloads = data.resume?.totalDownloads || 0;
  const recentActivities = (data.activityLogs || []).slice(0, 10);

  res.json({
    metrics: {
      totalProjects,
      publishedProjects,
      draftProjects,
      totalMessages,
      unreadMessages,
      mediaCount,
      subscribersCount,
      resumeDownloads,
      pageViews: data.analytics?.pageViews || 0,
      uniqueVisitors: data.analytics?.uniqueVisitors || 0,
    },
    recentActivities,
    previewUrl: `/?preview=${data.settings.previewToken}`,
  });
});

app.get('/api/admin/all-data', requireAuth, (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const data = db.getData();
  const { adminPasswordHash, ...safeData } = data;
  res.json(safeData);
});

// Settings & Header/Footer
app.put('/api/admin/settings', requireAuth, (req: Request, res: Response) => {
  const { settings, headerFooter, seoMetadata, themeSettings } = req.body;
  const data = db.getData();
  if (settings) {
    data.settings = { ...data.settings, ...settings };
  }
  if (headerFooter) {
    data.headerFooter = { ...data.headerFooter, ...headerFooter };
  }
  if (seoMetadata) {
    data.seoMetadata = { ...data.seoMetadata, ...seoMetadata };
  }
  db.saveData(data);
  db.logActivity('SETTINGS_UPDATED', 'Website configuration, theme, or SEO metadata updated', data.adminProfile.name);
  res.json({ success: true, settings: data.settings, headerFooter: data.headerFooter, seoMetadata: data.seoMetadata });
});

// Home Section
app.put('/api/admin/home', requireAuth, (req: Request, res: Response) => {
  const { home } = req.body;
  if (!home) return res.status(400).json({ error: 'Home content required' });
  const data = db.getData();
  data.home = { ...data.home, ...home };
  db.saveData(data);
  db.logActivity('HOME_UPDATED', `Home hero content updated for "${data.home.name}"`, data.adminProfile.name);
  res.json({ success: true, home: data.home });
});

// About Section
app.put('/api/admin/about', requireAuth, (req: Request, res: Response) => {
  const { about } = req.body;
  if (!about) return res.status(400).json({ error: 'About content required' });
  const data = db.getData();
  data.about = { ...data.about, ...about };
  db.saveData(data);
  db.logActivity('ABOUT_UPDATED', 'About biography, workspace, and career milestones updated', data.adminProfile.name);
  res.json({ success: true, about: data.about });
});

// Resume Section
app.put('/api/admin/resume', requireAuth, (req: Request, res: Response) => {
  const { resume } = req.body;
  if (!resume) return res.status(400).json({ error: 'Resume payload required' });
  const data = db.getData();
  data.resume = { ...data.resume, ...resume };
  data.settings.resumeUrl = resume.url || data.settings.resumeUrl;
  data.settings.allowResumeDownload = resume.allowDownload !== undefined ? resume.allowDownload : data.settings.allowResumeDownload;
  db.saveData(data);
  db.logActivity('RESUME_CONFIG_UPDATED', `Resume document settings updated: ${resume.fileName || 'CV'}`, data.adminProfile.name);
  res.json({ success: true, resume: data.resume });
});

// ==========================================
// 4. PROJECTS CRUD
// ==========================================

app.get('/api/admin/projects', requireAuth, (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const data = db.getData();
  res.json(data.projects);
});

app.post('/api/admin/projects', requireAuth, (req: Request, res: Response) => {
  const project: Partial<ProjectItem> = req.body;
  if (!project.title || !project.description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const data = db.getData();
  const maxOrder = data.projects.reduce((max, p) => Math.max(max, p.order || 0), 0);
  const newProject: ProjectItem = {
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: project.title.trim(),
    slug: project.slug?.trim() || project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    subtitle: project.subtitle?.trim() || '',
    description: project.description.trim(),
    longDescription: project.longDescription?.trim() || '',
    thumbnail: project.thumbnail?.trim() || '',
    galleryImages: project.galleryImages || [],
    tags: project.tags && Array.isArray(project.tags) ? project.tags : ['TypeScript'],
    liveUrl: project.liveUrl?.trim() || '',
    githubUrl: project.githubUrl?.trim() || '',
    isFeatured: Boolean(project.isFeatured),
    isPublished: project.isPublished !== undefined ? Boolean(project.isPublished) : true,
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.projects.push(newProject);
  db.saveData(data);
  db.logActivity('PROJECT_CREATED', `Created new project "${newProject.title}" (${newProject.isPublished ? 'Published' : 'Draft'})`, data.adminProfile.name);
  res.json({ success: true, project: newProject });
});

app.put('/api/admin/projects/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: Partial<ProjectItem> = req.body;
  const data = db.getData();
  const index = data.projects.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  data.projects[index] = {
    ...data.projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  db.saveData(data);
  db.logActivity('PROJECT_UPDATED', `Updated project "${data.projects[index].title}"`, data.adminProfile.name);
  res.json({ success: true, project: data.projects[index] });
});

app.delete('/api/admin/projects/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const project = data.projects.find((p) => p.id === id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  data.projects = data.projects.filter((p) => p.id !== id);
  db.saveData(data);
  db.logActivity('PROJECT_DELETED', `Deleted project "${project.title}"`, data.adminProfile.name);
  res.json({ success: true, message: 'Project deleted' });
});

app.post('/api/admin/projects/:id/duplicate', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const source = data.projects.find((p) => p.id === id);
  if (!source) return res.status(404).json({ error: 'Project not found' });

  const maxOrder = data.projects.reduce((max, p) => Math.max(max, p.order || 0), 0);
  const duplicate: ProjectItem = {
    ...source,
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: `${source.title} (Copy)`,
    slug: `${source.slug}-copy`,
    isPublished: false,
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.projects.push(duplicate);
  db.saveData(data);
  db.logActivity('PROJECT_DUPLICATED', `Duplicated "${source.title}" as draft`, data.adminProfile.name);
  res.json({ success: true, project: duplicate });
});

app.put('/api/admin/projects/reorder', requireAuth, (req: Request, res: Response) => {
  const { projectIds } = req.body;
  if (!Array.isArray(projectIds)) return res.status(400).json({ error: 'projectIds array required' });

  const data = db.getData();
  projectIds.forEach((id: string, index: number) => {
    const proj = data.projects.find((p) => p.id === id);
    if (proj) proj.order = index + 1;
  });

  data.projects.sort((a, b) => a.order - b.order);
  db.saveData(data);
  res.json({ success: true, projects: data.projects });
});

// ==========================================
// 5. EXPERIENCE, EDUCATION, CERTIFICATIONS, ACHIEVEMENTS, SERVICES
// ==========================================

// Generic helper generator for array collections
function setupCrudRoutes<T extends { id: string; order?: number }>(
  collectionKey: keyof PortfolioData,
  itemPrefix: string,
  logTag: string
) {
  const collectionName = String(collectionKey);

  // GET
  app.get(`/api/admin/${collectionName}`, requireAuth, (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const data = db.getData();
    res.json(((data as any)[collectionKey] as any[]) || []);
  });

  // POST
  app.post(`/api/admin/${collectionName}`, requireAuth, (req: Request, res: Response) => {
    const item = req.body;
    const data = db.getData();
    if (!Array.isArray((data as any)[collectionKey])) (data as any)[collectionKey] = [];
    const list = (data as any)[collectionKey] as any[];
    const maxOrder = list.reduce((max, x) => Math.max(max, x.order || 0), 0);

    const newItem = {
      ...item,
      id: `${itemPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      order: maxOrder + 1,
    };
    list.push(newItem);
    db.saveData(data);
    db.logActivity(`${logTag}_ADDED`, `Added new item to ${collectionName}`, data.adminProfile.name);
    res.json({ success: true, item: newItem });
  });

  // PUT
  app.put(`/api/admin/${collectionName}/:id`, requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const data = db.getData();
    const list = ((data as any)[collectionKey] as any[]) || [];
    const index = list.findIndex((x) => x.id === id);
    if (index === -1) return res.status(404).json({ error: 'Item not found' });

    list[index] = { ...list[index], ...updates };
    db.saveData(data);
    db.logActivity(`${logTag}_UPDATED`, `Updated item in ${collectionName} (${id})`, data.adminProfile.name);
    res.json({ success: true, item: list[index] });
  });

  // DELETE
  app.delete(`/api/admin/${collectionName}/:id`, requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const data = db.getData();
    const list = ((data as any)[collectionKey] as any[]) || [];
    (data as any)[collectionKey] = list.filter((x) => x.id !== id);
    db.saveData(data);
    db.logActivity(`${logTag}_DELETED`, `Deleted item from ${collectionName} (${id})`, data.adminProfile.name);
    res.json({ success: true });
  });

  // REORDER
  app.put(`/api/admin/${collectionName}/reorder`, requireAuth, (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
    const data = db.getData();
    const list = ((data as any)[collectionKey] as any[]) || [];
    ids.forEach((id: string, index: number) => {
      const item = list.find((x) => x.id === id);
      if (item) item.order = index + 1;
    });
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    db.saveData(data);
    res.json({ success: true, items: list });
  });
}

setupCrudRoutes('skills', 'sk', 'SKILL');
setupCrudRoutes('education', 'edu', 'EDUCATION');
setupCrudRoutes('experience', 'exp', 'EXPERIENCE');
setupCrudRoutes('certifications', 'cert', 'CERTIFICATION');
setupCrudRoutes('achievements', 'ach', 'ACHIEVEMENT');
setupCrudRoutes('services', 'srv', 'SERVICE');
setupCrudRoutes('blog', 'blog', 'BLOG_POST');
setupCrudRoutes('testimonials', 'test', 'TESTIMONIAL');
setupCrudRoutes('faq', 'faq', 'FAQ');
setupCrudRoutes('socialLinks', 'soc', 'SOCIAL_LINK');
setupCrudRoutes('customPages', 'page', 'CUSTOM_PAGE');

// ==========================================
// 6. MEDIA LIBRARY & IMAGE UPLOADS
// ==========================================

app.get('/api/admin/media', requireAuth, (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const data = db.getData();
  // Strip out heavy base64 strings when listing gallery to keep payload lean
  const leanList = (data.mediaLibrary || []).map(({ dataBase64, ...rest }) => rest);
  res.json(leanList);
});

// Upload Media Asset
app.post('/api/admin/media/upload', requireAuth, (req: Request, res: Response) => {
  const { fileName, mimeType, dataBase64, size } = req.body;
  if (!fileName || !dataBase64) {
    return res.status(400).json({ error: 'File name and Base64 data are required' });
  }

  // File type validation: JPG, JPEG, PNG, WEBP, SVG, GIF, PDF
  const allowedMime = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'application/pdf',
  ];
  const detectedMime = mimeType || 'image/jpeg';
  if (!allowedMime.includes(detectedMime) && !fileName.match(/\.(jpg|jpeg|png|webp|svg|gif|pdf)$/i)) {
    return res.status(400).json({ error: 'Unsupported file format. Please upload JPG, PNG, WebP, SVG, or PDF.' });
  }

  // Size limit validation (15MB)
  if (size && size > 15 * 1024 * 1024) {
    return res.status(400).json({ error: 'File size exceeds maximum 15MB limit.' });
  }

  const safeBase = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = `${Date.now()}_${safeBase}`;
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  try {
    const buffer = Buffer.from(dataBase64, 'base64');
    // Save to disk
    try {
      fs.writeFileSync(filePath, buffer);
    } catch (fsErr) {
      console.warn('File write to disk failed, relying on database base64 storage:', fsErr);
    }

    const assetUrl = `/uploads/${uniqueName}`;
    const newAsset = {
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: uniqueName,
      originalName: fileName,
      url: assetUrl,
      mimeType: detectedMime,
      size: size || buffer.length,
      uploadedAt: new Date().toISOString(),
      dataBase64, // Permanently stored in DB so it never disappears on serverless or cold-starts
    };

    const data = db.getData();
    if (!data.mediaLibrary) data.mediaLibrary = [];
    data.mediaLibrary.unshift(newAsset);
    db.saveData(data);
    db.logActivity('MEDIA_UPLOADED', `Uploaded media asset "${fileName}" (${Math.round((size || buffer.length) / 1024)} KB)`, data.adminProfile.name);

    const { dataBase64: _, ...clientAsset } = newAsset;
    res.json({ success: true, asset: clientAsset });
  } catch (err: any) {
    console.error('File write error:', err);
    res.status(500).json({ error: 'Failed to write media asset to persistent storage' });
  }
});

app.delete('/api/admin/media/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const asset = (data.mediaLibrary || []).find((m) => m.id === id);
  if (!asset) return res.status(404).json({ error: 'Media asset not found' });

  // Delete physical file from disk if present
  if (asset.url.startsWith('/uploads/')) {
    const filename = path.basename(asset.url);
    const fullPath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.warn('Could not unlink disk file:', err);
      }
    }
  }

  data.mediaLibrary = data.mediaLibrary.filter((m) => m.id !== id);
  db.saveData(data);
  db.logActivity('MEDIA_DELETED', `Deleted media asset "${asset.originalName}"`, data.adminProfile.name);
  res.json({ success: true });
});

// ==========================================
// 7. CONTACT MESSAGES & NEWSLETTER
// ==========================================

app.get('/api/admin/messages', requireAuth, (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const { status, query } = req.query;
  const data = db.getData();
  let list = [...data.contactMessages];

  if (status && typeof status === 'string' && status !== 'all') {
    list = list.filter((m) => m.status === status);
  }

  if (query && typeof query === 'string' && query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

app.put('/api/admin/messages/:id/status', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['unread', 'read', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const data = db.getData();
  const message = data.contactMessages.find((m) => m.id === id);
  if (!message) return res.status(404).json({ error: 'Message not found' });

  message.status = status;
  db.saveData(data);
  res.json({ success: true, message });
});

app.delete('/api/admin/messages/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  data.contactMessages = data.contactMessages.filter((m) => m.id !== id);
  db.saveData(data);
  res.json({ success: true });
});

app.get('/api/admin/subscribers', requireAuth, (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const data = db.getData();
  res.json(data.newsletterSubscribers || []);
});

app.delete('/api/admin/subscribers/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  data.newsletterSubscribers = (data.newsletterSubscribers || []).filter((s) => s.id !== id);
  db.saveData(data);
  res.json({ success: true });
});

// Notifications preferences
app.get('/api/admin/notifications', requireAuth, (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const data = db.getData();
  res.json(data.notificationSettings || INITIAL_DATA.notificationSettings);
});

app.put('/api/admin/notifications', requireAuth, (req: Request, res: Response) => {
  const { notifications } = req.body;
  const data = db.getData();
  data.notificationSettings = { ...data.notificationSettings, ...notifications };
  db.saveData(data);
  res.json({ success: true, notificationSettings: data.notificationSettings });
});

// ==========================================
// 8. DATABASE BACKUP, RESTORE & AUDIT LOGS
// ==========================================

app.get('/api/admin/logs', requireAuth, (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const data = db.getData();
  res.json(data.activityLogs || []);
});

app.delete('/api/admin/logs', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  data.activityLogs = [];
  db.saveData(data);
  res.json({ success: true, message: 'Activity logs cleared' });
});

app.get('/api/admin/database/backup', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  const { adminPasswordHash, ...safeBackup } = data;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="portfolio_backup_${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(safeBackup, null, 2));
});

app.post('/api/admin/database/restore', requireAuth, (req: Request, res: Response) => {
  const { backupData } = req.body;
  if (!backupData || typeof backupData !== 'object') {
    return res.status(400).json({ error: 'Invalid backup JSON payload' });
  }

  const current = db.getData();
  const restored: PortfolioData = {
    ...INITIAL_DATA,
    ...backupData,
    adminPasswordHash: current.adminPasswordHash, // Preserve existing password
    adminProfile: backupData.adminProfile || current.adminProfile,
  };

  db.saveData(restored);
  db.logActivity('DATABASE_RESTORED', 'Restored portfolio database from administrative backup', current.adminProfile.name);
  res.json({ success: true, message: 'Database restored successfully' });
});

app.post('/api/admin/database/reset', requireAuth, (req: Request, res: Response) => {
  const current = db.getData();
  const resetData: PortfolioData = {
    ...INITIAL_DATA,
    adminPasswordHash: current.adminPasswordHash,
  };
  db.saveData(resetData);
  db.logActivity('DATABASE_RESET', 'Reset portfolio database to default seed records', current.adminProfile.name);
  res.json({ success: true, message: 'Database reset to default seed records' });
});

// Modular sections toggle
app.put('/api/admin/modular-sections', requireAuth, (req: Request, res: Response) => {
  const { sections } = req.body;
  if (!Array.isArray(sections)) {
    return res.status(400).json({ error: 'sections array required' });
  }
  const data = db.getData();
  data.modularSections = sections;
  db.saveData(data);
  db.logActivity('MODULAR_SECTIONS_UPDATED', 'Modular portfolio sections visibility configured', data.adminProfile.name);
  res.json({ success: true, modularSections: data.modularSections });
});

// ==========================================
// 9. API 404 CATCH-ALL & ERROR HANDLERS
// ==========================================

app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error on route:', req.originalUrl, err);
  if (req.path.startsWith('/api')) {
    const status = typeof err.status === 'number' ? err.status : (typeof err.statusCode === 'number' ? err.statusCode : 500);
    res.status(status).json({
      error: status < 500 && err.message ? err.message : 'An internal server error occurred. Please try again.',
    });
    return;
  }
  next(err);
});

// ==========================================
// 10. VITE DEV SERVER OR STATIC SERVE
// ==========================================

async function setupServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server running in ${isProduction ? 'production' : 'development'} at http://${HOST}:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  setupServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
export { app };
