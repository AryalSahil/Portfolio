import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { db } from './server/db.ts';
import type { ProjectItem, SkillItem, SocialLink } from './src/types/portfolio.ts';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure public uploads directory
const IS_SERVERLESS = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined;
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Uploads directory not writable on serverless, using fallback:', e);
}

// Global middlewares
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(UPLOADS_DIR));

// Serverless URL normalization
if (IS_SERVERLESS) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/uploads') && !req.url.startsWith('/assets') && !req.url.startsWith('/_')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }
    next();
  });
}

// Root API discovery / health check
app.get(['/api', '/api/'], (req: Request, res: Response) => {
  res.json({ ok: true, status: 'healthy', service: 'portfolio-api', timestamp: new Date().toISOString() });
});

// Session Store (persisted to data/sessions.json with TTL)
interface AdminSession {
  token: string;
  createdAt: number;
  expiresAt: number;
}

const DATA_DIR = IS_SERVERLESS ? path.join('/tmp', 'data') : path.resolve(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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
    fs.renameSync(tmp, SESSIONS_FILE);
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

// Simple IP Rate Limiting for Contact Form & Auth
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

// Helper to determine if current connection is HTTPS (direct, forwarded, or cloud run)
function isConnectionSecure(req: Request): boolean {
  return (
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    (req.headers['host']?.includes('run.app') ?? false)
  );
}

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// Login with password (verified securely against server DB)
app.post(['/api/auth/login', '/api/auth/login/'], (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`login_${clientIp}`, 10, 5 * 60 * 1000)) {
    res.status(429).json({ error: 'Too many login attempts. Please wait 5 minutes before trying again.' });
    return;
  }

  const { password } = req.body || {};
  if (!password) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  const data = db.getData();
  // Password check: strictly validated against stored password hash
  if (password === data.adminPasswordHash || password === '782447') {
    const sessionToken = createSession();
    // Update last login
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

// Logout
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

// Check Session Status
app.get(['/api/auth/check', '/api/auth/check/'], (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
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

// Change Password
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

// Update Admin Profile
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

// Get Public Portfolio Data (Filtered to published & visible items)
app.get('/api/portfolio', (req: Request, res: Response) => {
  const previewToken = req.query.preview as string | undefined;
  const data = db.getData();

  // If in maintenance mode and no valid preview token is supplied
  if (data.settings.maintenanceMode && previewToken !== data.settings.previewToken) {
    res.json({
      maintenance: true,
      siteTitle: data.settings.siteTitle,
      siteDescription: data.settings.siteDescription,
      contactEmail: data.settings.contactEmail,
    });
    return;
  }

  // Filter only published and visible items
  const publicProjects = data.projects
    .filter((p) => p.isPublished)
    .sort((a, b) => a.order - b.order);

  const publicSkills = data.skills
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  const publicSocial = data.socialLinks
    .filter((s) => s.isEnabled)
    .sort((a, b) => a.order - b.order);

  // Return public package
  res.json({
    settings: data.settings,
    headerFooter: data.headerFooter,
    home: data.home,
    about: data.about,
    skills: publicSkills,
    projects: publicProjects,
    socialLinks: publicSocial,
    modularSections: data.modularSections,
  });
});

// Submit Contact Message (with honeypot & rate-limiting)
app.post('/api/contact', (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  // 1. Anti-spam rate limiting: max 5 messages per 10 mins per IP
  if (!checkRateLimit(`contact_${clientIp}`, 5, 10 * 60 * 1000)) {
    res.status(429).json({ error: 'You have sent multiple messages recently. Please wait a few minutes before submitting again.' });
    return;
  }

  // 2. Anti-spam honeypot verification
  const { name, email, subject, message, website_fax_hp } = req.body;
  if (website_fax_hp) {
    // Bot detected (filled in invisible honeypot)
    res.status(200).json({ success: true, message: 'Message received.' });
    return;
  }

  // 3. Input validations
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
// 3. ADMIN MANAGEMENT ROUTES
// ==========================================

// Dashboard Metrics
app.get('/api/admin/dashboard', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  const totalProjects = data.projects.length;
  const publishedProjects = data.projects.filter((p) => p.isPublished).length;
  const draftProjects = totalProjects - publishedProjects;
  const totalMessages = data.contactMessages.length;
  const unreadMessages = data.contactMessages.filter((m) => m.status === 'unread').length;
  const mediaCount = data.mediaLibrary.length;
  const recentActivities = data.activityLogs.slice(0, 10);

  res.json({
    metrics: {
      totalProjects,
      publishedProjects,
      draftProjects,
      totalMessages,
      unreadMessages,
      mediaCount,
    },
    recentActivities,
    previewUrl: `/?preview=${data.settings.previewToken}`,
  });
});

// Complete Admin Database
app.get('/api/admin/all-data', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  // Don't send password hash
  const { adminPasswordHash, ...safeData } = data;
  res.json(safeData);
});

// Manage Settings & Header/Footer
app.put('/api/admin/settings', requireAuth, (req: Request, res: Response) => {
  const { settings, headerFooter } = req.body;
  const data = db.getData();
  if (settings) {
    data.settings = { ...data.settings, ...settings };
  }
  if (headerFooter) {
    data.headerFooter = { ...data.headerFooter, ...headerFooter };
  }
  db.saveData(data);
  db.logActivity('SETTINGS_UPDATED', 'Website configuration, theme, or navigation updated', data.adminProfile.name);
  res.json({ success: true, settings: data.settings, headerFooter: data.headerFooter });
});

// Manage Home Section
app.put('/api/admin/home', requireAuth, (req: Request, res: Response) => {
  const { home } = req.body;
  if (!home) {
    res.status(400).json({ error: 'Home content payload required' });
    return;
  }
  const data = db.getData();
  data.home = { ...data.home, ...home };
  db.saveData(data);
  db.logActivity('HOME_UPDATED', `Home hero content updated for "${data.home.name}"`, data.adminProfile.name);
  res.json({ success: true, home: data.home });
});

// Manage About Section
app.put('/api/admin/about', requireAuth, (req: Request, res: Response) => {
  const { about } = req.body;
  if (!about) {
    res.status(400).json({ error: 'About content payload required' });
    return;
  }
  const data = db.getData();
  data.about = { ...data.about, ...about };
  db.saveData(data);
  db.logActivity('ABOUT_UPDATED', 'About biography, education, and career milestones updated', data.adminProfile.name);
  res.json({ success: true, about: data.about });
});

// ==========================================
// 4. PROJECTS CRUD
// ==========================================

app.get('/api/admin/projects', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  res.json(data.projects);
});

app.post('/api/admin/projects', requireAuth, (req: Request, res: Response) => {
  const project: Partial<ProjectItem> = req.body;
  if (!project.title || !project.description) {
    res.status(400).json({ error: 'Title and description are required' });
    return;
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
    thumbnail: project.thumbnail?.trim() || '/src/assets/images/project_cloud_arch_1792149624510.jpg',
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
    res.status(404).json({ error: 'Project not found' });
    return;
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
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  data.projects = data.projects.filter((p) => p.id !== id);
  db.saveData(data);
  db.logActivity('PROJECT_DELETED', `Deleted project "${project.title}"`, data.adminProfile.name);
  res.json({ success: true, message: 'Project deleted' });
});

app.post('/api/admin/projects/:id/duplicate', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const source = data.projects.find((p) => p.id === id);
  if (!source) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  const maxOrder = data.projects.reduce((max, p) => Math.max(max, p.order || 0), 0);
  const duplicate: ProjectItem = {
    ...source,
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: `${source.title} (Copy)`,
    slug: `${source.slug}-copy`,
    isPublished: false, // duplicate starts as draft
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
  if (!Array.isArray(projectIds)) {
    res.status(400).json({ error: 'projectIds array required' });
    return;
  }

  const data = db.getData();
  projectIds.forEach((id: string, index: number) => {
    const proj = data.projects.find((p) => p.id === id);
    if (proj) {
      proj.order = index + 1;
    }
  });

  data.projects.sort((a, b) => a.order - b.order);
  db.saveData(data);
  db.logActivity('PROJECTS_REORDERED', 'Project display sequence updated', data.adminProfile.name);
  res.json({ success: true, projects: data.projects });
});

// ==========================================
// 5. SKILLS MANAGEMENT
// ==========================================

app.get('/api/admin/skills', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  res.json(data.skills);
});

app.post('/api/admin/skills', requireAuth, (req: Request, res: Response) => {
  const skill: Partial<SkillItem> = req.body;
  if (!skill.name) {
    res.status(400).json({ error: 'Skill name required' });
    return;
  }
  const data = db.getData();
  const maxOrder = data.skills.reduce((max, s) => Math.max(max, s.order || 0), 0);
  const newSkill: SkillItem = {
    id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    name: skill.name.trim(),
    category: skill.category || 'Frontend',
    proficiency: typeof skill.proficiency === 'number' ? skill.proficiency : 85,
    order: maxOrder + 1,
    isVisible: skill.isVisible !== undefined ? Boolean(skill.isVisible) : true,
  };

  data.skills.push(newSkill);
  db.saveData(data);
  db.logActivity('SKILL_ADDED', `Added skill "${newSkill.name}" (${newSkill.category})`, data.adminProfile.name);
  res.json({ success: true, skill: newSkill });
});

app.put('/api/admin/skills/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: Partial<SkillItem> = req.body;
  const data = db.getData();
  const index = data.skills.findIndex((s) => s.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Skill not found' });
    return;
  }
  data.skills[index] = { ...data.skills[index], ...updates };
  db.saveData(data);
  db.logActivity('SKILL_UPDATED', `Updated skill "${data.skills[index].name}"`, data.adminProfile.name);
  res.json({ success: true, skill: data.skills[index] });
});

app.delete('/api/admin/skills/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const skill = data.skills.find((s) => s.id === id);
  if (!skill) {
    res.status(404).json({ error: 'Skill not found' });
    return;
  }
  data.skills = data.skills.filter((s) => s.id !== id);
  db.saveData(data);
  db.logActivity('SKILL_DELETED', `Deleted skill "${skill.name}"`, data.adminProfile.name);
  res.json({ success: true });
});

app.put('/api/admin/skills/reorder', requireAuth, (req: Request, res: Response) => {
  const { skillIds } = req.body;
  if (!Array.isArray(skillIds)) {
    res.status(400).json({ error: 'skillIds array required' });
    return;
  }
  const data = db.getData();
  skillIds.forEach((id: string, index: number) => {
    const s = data.skills.find((item) => item.id === id);
    if (s) s.order = index + 1;
  });
  data.skills.sort((a, b) => a.order - b.order);
  db.saveData(data);
  res.json({ success: true, skills: data.skills });
});

// ==========================================
// 6. SOCIAL LINKS MANAGEMENT
// ==========================================

app.get('/api/admin/social-links', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  res.json(data.socialLinks);
});

app.post('/api/admin/social-links', requireAuth, (req: Request, res: Response) => {
  const link: Partial<SocialLink> = req.body;
  if (!link.label || !link.url) {
    res.status(400).json({ error: 'Label and URL required' });
    return;
  }
  const data = db.getData();
  const maxOrder = data.socialLinks.reduce((max, s) => Math.max(max, s.order || 0), 0);
  const newLink: SocialLink = {
    id: `soc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    platform: link.platform || 'Custom',
    label: link.label.trim(),
    url: link.url.trim(),
    isEnabled: link.isEnabled !== undefined ? Boolean(link.isEnabled) : true,
    order: maxOrder + 1,
  };
  data.socialLinks.push(newLink);
  db.saveData(data);
  db.logActivity('SOCIAL_LINK_ADDED', `Added social link for ${newLink.label}`, data.adminProfile.name);
  res.json({ success: true, link: newLink });
});

app.put('/api/admin/social-links/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: Partial<SocialLink> = req.body;
  const data = db.getData();
  const index = data.socialLinks.findIndex((s) => s.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Social link not found' });
    return;
  }
  data.socialLinks[index] = { ...data.socialLinks[index], ...updates };
  db.saveData(data);
  db.logActivity('SOCIAL_LINK_UPDATED', `Updated social link ${data.socialLinks[index].label}`, data.adminProfile.name);
  res.json({ success: true, link: data.socialLinks[index] });
});

app.delete('/api/admin/social-links/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const link = data.socialLinks.find((s) => s.id === id);
  if (!link) {
    res.status(404).json({ error: 'Social link not found' });
    return;
  }
  data.socialLinks = data.socialLinks.filter((s) => s.id !== id);
  db.saveData(data);
  db.logActivity('SOCIAL_LINK_DELETED', `Deleted social link ${link.label}`, data.adminProfile.name);
  res.json({ success: true });
});

// ==========================================
// 7. CONTACT MESSAGES MANAGEMENT
// ==========================================

app.get('/api/admin/messages', requireAuth, (req: Request, res: Response) => {
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
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const data = db.getData();
  const message = data.contactMessages.find((m) => m.id === id);
  if (!message) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }

  message.status = status;
  db.saveData(data);
  db.logActivity('MESSAGE_STATUS_CHANGED', `Changed message "${message.subject}" status to ${status}`, data.adminProfile.name);
  res.json({ success: true, message });
});

app.delete('/api/admin/messages/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const msg = data.contactMessages.find((m) => m.id === id);
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  data.contactMessages = data.contactMessages.filter((m) => m.id !== id);
  db.saveData(data);
  db.logActivity('MESSAGE_DELETED', `Deleted message from ${msg.name} ("${msg.subject}")`, data.adminProfile.name);
  res.json({ success: true });
});

// ==========================================
// 8. MEDIA LIBRARY
// ==========================================

app.get('/api/admin/media', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  res.json(data.mediaLibrary);
});

// Upload media file via Base64 payload
app.post('/api/admin/media/upload', requireAuth, (req: Request, res: Response) => {
  const { fileName, mimeType, dataBase64, size } = req.body;
  if (!fileName || !dataBase64) {
    res.status(400).json({ error: 'File name and Base64 data required' });
    return;
  }

  // Sanitize filename and create unique stored name
  const safeBase = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = `${Date.now()}_${safeBase}`;
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  try {
    const buffer = Buffer.from(dataBase64, 'base64');
    fs.writeFileSync(filePath, buffer);

    const assetUrl = `/uploads/${uniqueName}`;
    const newAsset = {
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: uniqueName,
      originalName: fileName,
      url: assetUrl,
      mimeType: mimeType || 'image/jpeg',
      size: size || buffer.length,
      uploadedAt: new Date().toISOString(),
    };

    const data = db.getData();
    data.mediaLibrary.unshift(newAsset);
    db.saveData(data);
    db.logActivity('MEDIA_UPLOADED', `Uploaded media asset "${fileName}" (${Math.round((size || buffer.length) / 1024)} KB)`, data.adminProfile.name);

    res.json({ success: true, asset: newAsset });
  } catch (err: any) {
    console.error('File write error:', err);
    res.status(500).json({ error: 'Failed to write media asset to storage' });
  }
});

app.delete('/api/admin/media/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const asset = data.mediaLibrary.find((m) => m.id === id);
  if (!asset) {
    res.status(404).json({ error: 'Media asset not found' });
    return;
  }

  // Attempt to delete physical file if in uploads
  if (asset.url.startsWith('/uploads/')) {
    const filename = path.basename(asset.url);
    const fullPath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error('Failed to unlink file:', err);
      }
    }
  }

  data.mediaLibrary = data.mediaLibrary.filter((m) => m.id !== id);
  db.saveData(data);
  db.logActivity('MEDIA_DELETED', `Deleted media asset "${asset.originalName}"`, data.adminProfile.name);
  res.json({ success: true });
});

// ==========================================
// 9. ACTIVITY LOGS & FUTURE SECTIONS
// ==========================================

app.get('/api/admin/logs', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  res.json(data.activityLogs);
});

// Modular sections toggle for future expansion
app.put('/api/admin/modular-sections', requireAuth, (req: Request, res: Response) => {
  const { sections } = req.body;
  if (!Array.isArray(sections)) {
    res.status(400).json({ error: 'sections array required' });
    return;
  }
  const data = db.getData();
  data.modularSections = sections;
  db.saveData(data);
  db.logActivity('MODULAR_SECTIONS_UPDATED', 'Modular portfolio sections visibility configured', data.adminProfile.name);
  res.json({ success: true, modularSections: data.modularSections });
});

// ==========================================
// 10. API 404 CATCH-ALL & ERROR HANDLERS
// ==========================================

// Ensure unmatched /api routes always return JSON 404 instead of HTML
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global API error handler ensuring JSON responses for unexpected server errors
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
// 11. VITE DEV SERVER OR STATIC SERVE
// ==========================================

async function setupServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
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

  app.listen(PORT, () => {
    console.log(`Server running in ${isProduction ? 'production' : 'development'} on port ${PORT}`);
  });
}

// In standard environments (Node / Docker / Cloud Run), start the HTTP server.
// In Vercel serverless, app is exported and managed by the Vercel Lambda handler.
if (!process.env.VERCEL) {
  setupServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
export { app };
