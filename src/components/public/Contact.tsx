import React, { useState } from 'react';
import { SocialLink } from '../../types/portfolio.js';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, ArrowUpRight, Github, Linkedin, Twitter, Youtube, Globe } from 'lucide-react';

interface ContactProps {
  contactEmail: string;
  socialLinks: SocialLink[];
}

export const Contact: React.FC<ContactProps> = ({ contactEmail, socialLinks }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website_fax_hp: '', // Honeypot field for anti-spam
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ success: boolean; message: string } | null>(null);

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github': return <Github className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'x':
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setStatus('error');
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      setStatus('error');
      setErrorMessage('Please provide a subject line for your message.');
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setStatus('error');
      setErrorMessage('Please include a detailed message (at least 10 characters).');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit inquiry. Please try again.');
      }

      setStatus('success');
      setSuccessMessage(result.message || 'Thank you for reaching out! Your message has been received.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        website_fax_hp: '',
      });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again later.');
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const r = await res.json();
      if (res.ok) {
        setNewsletterStatus({ success: true, message: r.message || 'Subscribed successfully!' });
        setNewsletterEmail('');
      } else {
        setNewsletterStatus({ success: false, message: r.error || 'Could not subscribe.' });
      }
    } catch {
      setNewsletterStatus({ success: false, message: 'Could not connect. Please try again.' });
    }
  };

  const enabledSocialLinks = (socialLinks || []).filter((s) => s.isEnabled !== false);

  return (
    <section id="contact" className="py-20 md:py-28 border-t border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-widest text-indigo-400 font-semibold font-mono">
            Direct Inquiries
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Get In Touch
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl">
            Have a project in mind, an opportunity to discuss, or an engineering inquiry? Send a direct message below.
          </p>
        </div>

        {/* 2-Column Split: Info / Connectivity vs Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Direct Contacts & Social Links */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 space-y-6">
              {contactEmail && contactEmail.trim().length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-500">Direct Email</div>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-base sm:text-lg font-semibold text-white hover:text-indigo-400 transition-colors flex items-center gap-2 group"
                  >
                    <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span className="truncate">{contactEmail}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-transform" />
                  </a>
                </div>
              )}

              {/* Newsletter Subscription */}
              <div className="pt-2 space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Newsletter & Updates
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Subscribe to receive technical articles, case studies, and occasional project announcements.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 text-xs font-semibold bg-white text-slate-950 rounded-lg hover:bg-slate-200 transition-colors shrink-0 cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
                {newsletterStatus && (
                  <div className={`text-xs ${newsletterStatus.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {newsletterStatus.message}
                  </div>
                )}
              </div>

              {/* Social Channels (only if configured) */}
              {enabledSocialLinks.length > 0 && (
                <div className="pt-4 border-t border-slate-800/60 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-500">Social & Profiles</div>
                  <div className="flex flex-col gap-2">
                    {enabledSocialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-xs text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          {getSocialIcon(link.platform)}
                          <span>{link.label}</span>
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Verified Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 relative">
              {status === 'success' ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Message Received</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    {successMessage}
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot anti-spam field */}
                  <input
                    type="text"
                    name="website_fax_hp"
                    value={formData.website_fax_hp}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />

                  {status === 'error' && errorMessage && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        Your Name <span className="text-indigo-400">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Alex Morgan"
                        className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        Email Address <span className="text-indigo-400">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="alex@company.com"
                        className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Subject <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      id="subject"
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Project inquiry or collaboration"
                      className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Message <span className="text-indigo-400">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell me about your project, timeline, or requirements..."
                      className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-y min-h-[120px]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-white hover:bg-slate-100 disabled:bg-slate-700 disabled:text-slate-400 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-indigo-500/10"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
