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

    // Client side validation
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

  return (
    <section id="contact" className="py-20 md:py-28 border-t border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-widest text-indigo-400 font-semibold font-mono">
            03. Direct Inquiries & Collaboration
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Initiate a Dialogue
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl">
            Have a distributed system challenge, technical advisory inquiry, or ambitious product in mind? Send a direct message below.
          </p>
        </div>

        {/* 2-Column Split: Info / Connectivity vs Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Direct Contacts & Social Links */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500">Direct Email</div>
                <a
                  href={`mailto:${contactEmail || 'contact@studio-aetheria.dev'}`}
                  className="text-base sm:text-lg font-semibold text-white hover:text-indigo-400 transition-colors flex items-center gap-2 group"
                >
                  <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span className="truncate">{contactEmail || 'contact@studio-aetheria.dev'}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-transform" />
                </a>
              </div>

              <div className="pt-4 border-t border-slate-800/60 space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500">Location & Timezone</div>
                <div className="text-sm text-slate-300">San Francisco, CA (PST · UTC-8)</div>
                <p className="text-xs text-slate-500">Available for hybrid engagements and global remote advisories.</p>
              </div>

              {/* Newsletter Subscription */}
              <div className="pt-4 border-t border-slate-800/60 space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Engineering Monograph Dispatch</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Join 1,200+ engineers receiving bi-monthly essays on consensus safety, WebGL performance, and design systems.
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const target = e.target as HTMLFormElement;
                    const emailInput = target.elements.namedItem('news_email') as HTMLInputElement;
                    if (!emailInput?.value) return;
                    try {
                      const res = await fetch('/api/newsletter/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: emailInput.value }),
                      });
                      const r = await res.json();
                      alert(r.message || 'Subscribed successfully!');
                      target.reset();
                    } catch {
                      alert('Could not subscribe. Please try again.');
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    name="news_email"
                    placeholder="you@company.com"
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
              </div>

              {/* Social Channels */}
              {socialLinks && socialLinks.length > 0 && (
                <div className="pt-4 border-t border-slate-800/60 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-500">Professional Networks</div>
                  <div className="flex flex-col gap-2">
                    {socialLinks.map((link) => (
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

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-800/80 bg-slate-900/50 shadow-xl relative">
              {/* Success Notification */}
              {status === 'success' && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-emerald-200">Message Sent Successfully</p>
                    <p>{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Error Notification */}
              {status === 'error' && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-rose-200">Submission Error</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot Anti-spam (Hidden from visual users) */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Your Name <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alex Chen"
                      required
                      className="w-full px-4 py-2.5 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Your Email <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="alex@company.com"
                      required
                      className="w-full px-4 py-2.5 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Subject field */}
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Subject <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Engineering Advisory or Project Collaboration"
                    required
                    className="w-full px-4 py-2.5 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                {/* Message field */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Message <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me about your technical objectives, timeline, or scope..."
                    required
                    className="w-full px-4 py-2.5 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-y"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-3 px-6 text-sm font-semibold text-slate-950 bg-white hover:bg-slate-200 disabled:bg-slate-700 disabled:text-slate-400 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Transmit Message</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
