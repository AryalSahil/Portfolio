import fs from 'fs';
import path from 'path';
import type { PortfolioData } from '../src/types/portfolio.ts';

const BUNDLED_DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_DIR = BUNDLED_DATA_DIR;
const DB_FILE = path.join(DATA_DIR, 'portfolio_db.json');

export const INITIAL_DATA: PortfolioData = {
  settings: {
    siteTitle: 'Elena Vance — Principal Product Engineer & Architect',
    siteDescription: 'Portfolio and selected works of Elena Vance, specialized in high-throughput cloud distributed systems, modern reactive interfaces, and design engineering.',
    primaryColor: '#6366f1',
    accentColor: '#38bdf8',
    themeMode: 'dark',
    maintenanceMode: false,
    maintenanceMessage: 'We are performing scheduled updates to our distributed infrastructure. The portfolio will be available shortly.',
    previewToken: 'preview_aetheria_2026',
    resumeUrl: '/uploads/elena_vance_cv_2026.pdf',
    allowResumeDownload: true,
    contactEmail: 'elena.vance@studio-aetheria.dev',
  },
  headerFooter: {
    brandName: 'Elena Vance',
    logoUrl: '',
    navItems: [
      { id: 'nav-home', label: 'Home', href: '#home', order: 1, isVisible: true },
      { id: 'nav-about', label: 'About', href: '#about', order: 2, isVisible: true },
      { id: 'nav-work', label: 'Work', href: '#work', order: 3, isVisible: true },
      { id: 'nav-experience', label: 'Experience', href: '#experience', order: 4, isVisible: true },
      { id: 'nav-skills', label: 'Skills', href: '#skills', order: 5, isVisible: true },
      { id: 'nav-services', label: 'Services', href: '#services', order: 6, isVisible: true },
      { id: 'nav-blog', label: 'Articles', href: '#blog', order: 7, isVisible: true },
      { id: 'nav-faq', label: 'FAQ', href: '#faq', order: 8, isVisible: true },
      { id: 'nav-contact', label: 'Contact', href: '#contact', order: 9, isVisible: true },
    ],
    footerText: 'Crafting resilient distributed backends, precise design systems, and joyful digital experiences.',
    copyrightText: '© 2026 Elena Vance. All rights reserved.',
    showSocialInFooter: true,
  },
  home: {
    name: 'Elena Vance',
    title: 'Principal Product Engineer & Architect',
    subtitle: 'High-throughput systems · Reactive interfaces · Precision UI',
    intro: 'I design and engineer mission-critical cloud platforms, ultra-responsive digital products, and design systems for ambitious technical teams worldwide.',
    profilePhotoUrl: '/images/hero_portrait_1792149624424.jpg',
    primaryCtaText: 'View My Work',
    primaryCtaLink: '#work',
    secondaryCtaText: 'Contact Me',
    secondaryCtaLink: '#contact',
    showStats: true,
    stats: [
      { label: 'Years Experience', value: '10+', subtext: 'Distributed engineering' },
      { label: 'Production Systems', value: '45+', subtext: 'Zero-downtime releases' },
      { label: 'Global Traffic', value: '250M+', subtext: 'Monthly API requests' },
      { label: 'Patents & Papers', value: '4', subtext: 'Distributed consensus' },
    ],
    isPublished: true,
  },
  about: {
    bioTitle: 'Engineering at the intersection of architectural rigor and intuitive design.',
    bioParagraphs: [
      'Over the past decade, I have focused on building distributed systems that scale predictably and user interfaces that feel instantaneous. My work spans low-latency event-driven backends, WebGL visualization pipelines, and comprehensive enterprise design languages.',
      'I believe the best software products emerge when deep systems infrastructure meets unapologetic attention to typographic nuance, kinetic feedback, and human ergonomics. When not in code, you can find me restoring analog synthesis hardware and mentoring open-source contributors.'
    ],
    profilePhotoUrl: '/images/about_workspace_1792149624407.jpg',
    resumeUrl: '/uploads/elena_vance_cv_2026.pdf',
    resumeButtonText: 'Download Resume',
    showResume: true,
    interests: [
      'Distributed Consensus Algorithms',
      'High-Performance WebGL & Canvas',
      'Modular Analog Synthesizers',
      'Mechanical Keyboard Typography',
      'Specialty Pour-Over Coffee',
      'Ultra-Distance Trail Running'
    ],
    education: [
      {
        id: 'edu-1',
        degree: 'M.S. in Computer Science (Distributed Systems)',
        institution: 'Stanford University',
        period: '2016 — 2018',
        description: 'Focus on fault-tolerant distributed algorithms, Raft consensus validation, and peer-to-peer data replication.',
        order: 1,
        isPublished: true,
      },
      {
        id: 'edu-2',
        degree: 'B.S. in Software Engineering & Human-Computer Interaction',
        institution: 'University of Washington',
        period: '2012 — 2016',
        description: 'Graduated Magna Cum Laude. Led university developer guild and authored thesis on reactive state management.',
        order: 2,
        isPublished: true,
      }
    ],
    careerGoals: [
      { id: 'cg-1', goal: 'Pioneer zero-copy browser data engines for collaborative spatial computing', timeframe: '2026-2027', isCompleted: false },
      { id: 'cg-2', goal: 'Author an open-source visual telemetry framework with sub-millisecond overhead', timeframe: '2026', isCompleted: true },
      { id: 'cg-3', goal: 'Foster engineering fellowships for underrepresented developers in open-source systems', timeframe: 'Ongoing', isCompleted: false },
    ],
    isPublished: true,
  },
  skills: [
    { id: 'sk-1', name: 'TypeScript & React 19', category: 'Frontend', proficiency: 98, order: 1, isVisible: true },
    { id: 'sk-2', name: 'Tailwind CSS & Motion', category: 'Frontend', proficiency: 95, order: 2, isVisible: true },
    { id: 'sk-3', name: 'Node.js & Go Microservices', category: 'Backend', proficiency: 94, order: 3, isVisible: true },
    { id: 'sk-4', name: 'PostgreSQL & Redis Streams', category: 'Backend', proficiency: 92, order: 4, isVisible: true },
    { id: 'sk-5', name: 'Kubernetes & Docker', category: 'Cloud & DevOps', proficiency: 90, order: 5, isVisible: true },
    { id: 'sk-6', name: 'GraphQL & gRPC APIs', category: 'Backend', proficiency: 88, order: 6, isVisible: true },
    { id: 'sk-7', name: 'Design Systems Architecture', category: 'Design & Architecture', proficiency: 96, order: 7, isVisible: true },
    { id: 'sk-8', name: 'Distributed Consensus & Raft', category: 'Design & Architecture', proficiency: 86, order: 8, isVisible: true },
    { id: 'sk-9', name: 'Vite, esbuild & Webpack', category: 'Tools', proficiency: 92, order: 9, isVisible: true },
    { id: 'sk-10', name: 'CI/CD & Observability (Grafana)', category: 'Cloud & DevOps', proficiency: 89, order: 10, isVisible: true },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Aether Distributed Telemetry Mesh',
      slug: 'aether-telemetry-mesh',
      subtitle: 'Real-time multi-cloud packet visualizer handling 250k events/sec',
      description: 'A low-latency network intelligence canvas visualizing distributed packet routes, latency spikes, and automatic partition failovers across three cloud providers with sub-millisecond precision.',
      longDescription: 'Engineered an event-driven telemetry platform using WebSockets, WebGL instanced rendering, and an in-memory streaming engine. Provides enterprise DevOps teams with live spatial network topology graphs and automated anomaly detection.',
      thumbnail: '/images/project_cloud_arch_1792149624510.jpg',
      galleryImages: ['/images/project_cloud_arch_1792149624510.jpg'],
      tags: ['TypeScript', 'WebGL', 'Go', 'Redis', 'Kubernetes'],
      liveUrl: 'https://demo.aether-telemetry.dev',
      githubUrl: 'https://github.com/elena-vance/aether-mesh',
      isFeatured: true,
      isPublished: true,
      order: 1,
      createdAt: '2026-08-12T10:00:00.000Z',
      updatedAt: '2026-10-01T14:30:00.000Z',
    },
    {
      id: 'proj-2',
      title: 'Nova Unified Design System & Studio',
      slug: 'nova-design-system',
      subtitle: 'Component architecture with zero-runtime CSS tokens and strict accessibility',
      description: 'An enterprise multi-brand design system featuring 40+ accessible headless components, fluid typographic scales, automated contrast verifications, and interactive token workbench.',
      longDescription: 'Nova powers 12 internal applications across 4 business divisions. It features automated token synchronization from Figma directly into CSS variables, 100% keyboard accessibility compliance, and sub-10kb bundle overhead.',
      thumbnail: '/images/project_design_system_1792149625333.jpg',
      galleryImages: ['/images/project_design_system_1792149625333.jpg'],
      tags: ['React 19', 'Tailwind CSS', 'Figma API', 'Radix Primitives', 'Storybook'],
      liveUrl: 'https://nova-design-studio.dev',
      githubUrl: 'https://github.com/elena-vance/nova-tokens',
      isFeatured: true,
      isPublished: true,
      order: 2,
      createdAt: '2026-06-20T08:00:00.000Z',
      updatedAt: '2026-09-15T11:00:00.000Z',
    },
    {
      id: 'proj-3',
      title: 'Aural Harmonic Neural Synthesizer',
      slug: 'aural-harmonic-synth',
      subtitle: 'Browser-native additive audio engine with live FFT spectrum analyzer',
      description: 'A Web Audio API instrument capable of polyphonic analog oscillator synthesis, frequency modulation, custom wavetable importing, and hardware MIDI controller support.',
      longDescription: 'Utilizes Web Audio AudioWorklet nodes running on a dedicated audio rendering thread for sample-accurate timing and zero UI jitter. Includes a custom Canvas 2D FFT oscilloscope and interactive filter envelopes.',
      thumbnail: '/images/project_audio_neural_1792149625520.jpg',
      galleryImages: ['/images/project_audio_neural_1792149625520.jpg'],
      tags: ['Web Audio API', 'AudioWorklet', 'Canvas 2D', 'Web MIDI', 'DSP'],
      liveUrl: 'https://synth.aural-harmonic.dev',
      githubUrl: 'https://github.com/elena-vance/aural-synth',
      isFeatured: true,
      isPublished: true,
      order: 3,
      createdAt: '2026-04-10T16:00:00.000Z',
      updatedAt: '2026-08-22T09:45:00.000Z',
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'M.S. in Computer Science (Distributed Systems)',
      institution: 'Stanford University',
      period: '2016 — 2018',
      description: 'Focus on fault-tolerant distributed algorithms, Raft consensus validation, and peer-to-peer data replication.',
      order: 1,
      isPublished: true,
    },
    {
      id: 'edu-2',
      degree: 'B.S. in Software Engineering & Human-Computer Interaction',
      institution: 'University of Washington',
      period: '2012 — 2016',
      description: 'Graduated Magna Cum Laude. Led university developer guild and authored thesis on reactive state management.',
      order: 2,
      isPublished: true,
    }
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Aetheria Cloud Infrastructure',
      role: 'Principal Systems Architect',
      location: 'San Francisco, CA (Remote)',
      period: '2022 — Present',
      description: 'Lead technical architect overseeing global telemetry infrastructure, real-time observability pipelines, and cross-region consensus layers.',
      achievements: [
        'Architected a distributed telemetry pipeline processing 250M+ events daily with p99 latency under 12ms',
        'Spearheaded transition to Kubernetes-orchestrated microservices reducing multi-cloud egress costs by 34%',
        'Mentored 18 senior and staff engineers across core backend infrastructure and reactive client interfaces'
      ],
      isCurrent: true,
      isPublished: true,
      order: 1,
    },
    {
      id: 'exp-2',
      company: 'Stratos Systems Laboratory',
      role: 'Senior Staff Frontend Architect',
      location: 'Seattle, WA',
      period: '2019 — 2022',
      description: 'Spearheaded design engineering, headless design token architectures, and high-performance WebGL visualization tooling for cloud networks.',
      achievements: [
        'Created enterprise design system deployed across 14 enterprise SaaS applications with zero regressions',
        'Engineered GPU-accelerated canvas topology visualizer rendering 50,000 nodes at steady 60 FPS in browser',
        'Reduced bundle payload by 48% through tree-shaking optimization and custom micro-frontend bundler plugin'
      ],
      isCurrent: false,
      isPublished: true,
      order: 2,
    },
    {
      id: 'exp-3',
      company: 'Helios Data Platforms',
      role: 'Distributed Systems Engineer',
      location: 'Palo Alto, CA',
      period: '2018 — 2019',
      description: 'Developed high-throughput data ingestion services, Raft consensus coordinator nodes, and Redis streaming layers.',
      achievements: [
        'Implemented Raft consensus leader election module with zero split-brain failure rates over 18 months',
        'Optimized Postgres query patterns and cache tier leading to 3x increase in peak read throughput'
      ],
      isCurrent: false,
      isPublished: true,
      order: 3,
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      title: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      issueDate: '2024-05',
      expiryDate: '2027-05',
      credentialId: 'AWS-PSA-8849201',
      credentialUrl: 'https://aws.amazon.com/verification',
      badgeImage: '',
      isPublished: true,
      order: 1,
    },
    {
      id: 'cert-2',
      title: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation (CNCF)',
      issueDate: '2023-11',
      expiryDate: '2026-11',
      credentialId: 'CKA-2300-84910',
      credentialUrl: 'https://www.cncf.io/certification/cka/',
      badgeImage: '',
      isPublished: true,
      order: 2,
    },
    {
      id: 'cert-3',
      title: 'Google Cloud Professional Cloud Architect',
      issuer: 'Google Cloud',
      issueDate: '2023-03',
      expiryDate: '2026-03',
      credentialId: 'GCP-PCA-910248',
      credentialUrl: 'https://cloud.google.com/certification',
      badgeImage: '',
      isPublished: true,
      order: 3,
    }
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'Best Technical Architecture Award 2025',
      organization: 'Distributed Cloud World Congress',
      date: '2025-10',
      description: 'Honored for pioneering sub-millisecond network topology visualizers running natively inside standard web browsers.',
      badgeIcon: 'Trophy',
      url: 'https://distributedcloudcongress.org/awards',
      isPublished: true,
      order: 1,
    },
    {
      id: 'ach-2',
      title: 'US Patent: Non-blocking Distributed Partition Replication',
      organization: 'USPTO #11,894,204',
      date: '2024-07',
      description: 'Co-inventor of zero-copy state synchronization mechanisms across heterogeneous cloud regions.',
      badgeIcon: 'Award',
      url: 'https://patents.google.com',
      isPublished: true,
      order: 2,
    },
    {
      id: 'ach-3',
      title: 'Open Source Fellow & Contributor Grant',
      organization: 'Cloud Native Open Systems Initiative',
      date: '2023-04',
      description: 'Recipient of $50k grant for advancing open-source telemetry parsers in TypeScript and Rust.',
      badgeIcon: 'Sparkles',
      url: 'https://opensource.org',
      isPublished: true,
      order: 3,
    }
  ],
  services: [
    {
      id: 'srv-1',
      title: 'Distributed Cloud Architecture & Scale Audit',
      description: 'End-to-end evaluation of multi-region backend infrastructure, database topology, caching tiers, and failover resilience.',
      deliverables: [
        'Comprehensive 40+ page architecture health & bottleneck report',
        'p99 latency optimization roadmap and throughput benchmark suite',
        'Zero-downtime database migration strategy and replication blueprint'
      ],
      pricing: 'Retainer or Fixed Sprint',
      isPublished: true,
      order: 1,
    },
    {
      id: 'srv-2',
      title: 'Enterprise Design Systems & UI Architecture',
      description: 'Construction of accessible, headless multi-brand design systems with token automation from Figma to production code.',
      deliverables: [
        'Production-grade token engine with CSS variable orchestration',
        'Full WCAG AAA accessibility compliance and automated visual tests',
        'Tailwind / React component library with interactive documentation'
      ],
      pricing: 'Project Based',
      isPublished: true,
      order: 2,
    },
    {
      id: 'srv-3',
      title: 'Technical Advisory & Fractional Leadership',
      description: 'Strategic engineering guidance for executive teams, board presentations, and scaling senior engineering organizations.',
      deliverables: [
        'Bi-weekly architectural steering and RFC reviews',
        'Senior staff engineer hiring evaluations and mentoring',
        'Cloud expenditure and infrastructure cost optimization'
      ],
      pricing: 'Monthly Advisory Retainer',
      isPublished: true,
      order: 3,
    }
  ],
  resume: {
    url: '/uploads/elena_vance_cv_2026.pdf',
    fileName: 'Elena_Vance_Curriculum_Vitae_2026.pdf',
    lastUpdated: '2026-10-18T00:00:00.000Z',
    allowDownload: true,
    totalDownloads: 142,
    downloadLogs: [
      { id: 'dl-1', timestamp: '2026-10-17T18:42:10.000Z', ip: '198.51.100.12' },
      { id: 'dl-2', timestamp: '2026-10-16T14:12:05.000Z', ip: '203.0.113.88' },
    ],
  },
  blog: [
    {
      id: 'blog-1',
      title: 'Architecting Zero-Copy Event Loops in WebGL Telemetry',
      slug: 'zero-copy-event-loops-webgl',
      excerpt: 'How we streamed 250,000 real-time network packets per second directly from WebSocket buffers into GPU vertex arrays without garbage collection pauses.',
      content: `### High-Throughput WebGL Telemetry in Browser Runtimes

When building real-time observability tools, the traditional JavaScript model of allocating individual objects for every network metric quickly leads to devastating garbage collection (GC) pauses. At 250k events per second, minor GC cycles can freeze the main UI thread for 40-80 milliseconds at a time.

#### 1. Direct ArrayBuffer Transfer
By utilizing transferrable \`ArrayBuffer\` objects across Web Workers and feeding raw float arrays directly into GPU instanced buffers, we eliminated all intermediate JSON parsing and object allocations.

\`\`\`typescript
const worker = new Worker('/telemetry-worker.js');
worker.onmessage = (event) => {
  const { buffer, count } = event.data;
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, buffer);
  gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
};
\`\`\`

#### 2. Ring Buffer Recycling
Instead of instantiating new typed arrays on each frame tick, we allocate a fixed 64MB circular memory ring buffer once at application boot. Incoming network packets write into the head pointer, while the WebGL render loop reads from the tail pointer.

The result is a steady 60 FPS interface that consumes fewer than 120MB of browser RAM even after 24 hours of continuous streaming.`,
      coverImage: '/images/project_cloud_arch_1792149624510.jpg',
      tags: ['TypeScript', 'WebGL', 'Performance', 'Distributed Systems'],
      publishedAt: '2026-09-28T10:00:00.000Z',
      readTimeMinutes: 7,
      isPublished: true,
      order: 1,
    },
    {
      id: 'blog-2',
      title: 'Practical Consensus: Surviving Split-Brain in Hybrid Clouds',
      slug: 'practical-consensus-hybrid-clouds',
      excerpt: 'Lessons learned implementing the Raft protocol across multi-region cloud providers with asymmetric network partitions.',
      content: `### Consensus When Networks Are Hostile

Distributed consensus sounds simple in academic papers: majority quorum wins, leader commits entries, followers replicate state. But in multi-cloud production setups, network partitions rarely manifest as clean binary failures.

Instead, you encounter asymmetric latency spikes, flapping TCP keep-alives, and unidirectional packet drops where node A can send to node B, but B cannot respond to A.

#### 1. Pre-Vote Phases Prevent Disruption
Standard Raft triggers election timeouts whenever heartbeats are missed. If a partitioned follower repeatedly starts elections and increments its term number, rejoining the cluster can force an otherwise healthy leader to step down. Implementing the Raft **Pre-Vote** algorithm resolves this by ensuring candidates only advance terms if a quorum of peers confirms they would vote for them.

#### 2. Leased Read Quorums
To sustain 50,000 reads/sec without routing every query through the Raft log, leader leases combined with monotonic clocks guarantee linearizable reads without incurring disk fsync overhead on read paths.`,
      coverImage: '/images/project_design_system_1792149625333.jpg',
      tags: ['Raft', 'Architecture', 'Go', 'Databases'],
      publishedAt: '2026-08-14T14:30:00.000Z',
      readTimeMinutes: 9,
      isPublished: true,
      order: 2,
    },
    {
      id: 'blog-3',
      title: 'Design Tokens Beyond CSS: Generating Multi-Platform Contracts',
      slug: 'design-tokens-multi-platform-contracts',
      excerpt: 'Automating the transformation of Figma semantic variables into type-safe CSS custom properties, Tailwind plugins, and Kotlin Compose themes.',
      content: `### The Single Source of Truth for Visual Design

A design token is more than a hex code; it is an architectural contract between design intentions and production user experiences.

When designing the Nova system, we automated our token pipeline so that any change committed in Figma automatically triggers a GitHub Actions pipeline that verifies contrast ratios against WCAG 2.2 criteria, generates strict TypeScript types, and publishes immutable versioned npm packages.`,
      coverImage: '/images/project_audio_neural_1792149625520.jpg',
      tags: ['Design Systems', 'React', 'CSS', 'Tooling'],
      publishedAt: '2026-07-05T09:15:00.000Z',
      readTimeMinutes: 5,
      isPublished: true,
      order: 3,
    }
  ],
  testimonials: [
    {
      id: 'test-1',
      clientName: 'Julian Alvarez',
      clientRole: 'VP of Engineering',
      clientCompany: 'Stratos Cloud Platforms',
      avatarUrl: '',
      content: 'Elena Vance is one of the rarest software engineers in the industry: an architect who can design distributed Raft consensus clusters and simultaneously craft an exquisite, micro-animated user interface with sub-millisecond responsiveness. Her work directly enabled our Series B launch.',
      rating: 5,
      isPublished: true,
      order: 1,
    },
    {
      id: 'test-2',
      clientName: 'Dr. Evelyn Chen',
      clientRole: 'Head of Core Infrastructure',
      clientCompany: 'Aetheria Labs',
      avatarUrl: '',
      content: 'Elena audited our streaming architecture and eliminated our persistent p99 latency spikes in less than three weeks. Her deep understanding of system internals and clean API contracts made her an indispensable advisor to our principal staff.',
      rating: 5,
      isPublished: true,
      order: 2,
    },
    {
      id: 'test-3',
      clientName: 'Sophia Lindqvist',
      clientRole: 'Design Director',
      clientCompany: 'Nordic Digital Studio',
      avatarUrl: '',
      content: 'Working with Elena on the Nova design system set a new benchmark for how our engineering and design teams collaborate. The precision of her typography, accessibility standards, and token automation saved our team hundreds of hours.',
      rating: 5,
      isPublished: true,
      order: 3,
    }
  ],
  faq: [
    {
      id: 'faq-1',
      question: 'What types of consulting and advisory projects do you take on?',
      answer: 'I primarily partner with ambitious technical startups and scale-ups on high-throughput backend architecture, real-time distributed telemetry, and enterprise design systems. Engagements typically range from 2-week architectural deep audits to 6-month fractional staff advisory retainers.',
      category: 'Consulting & Services',
      isPublished: true,
      order: 1,
    },
    {
      id: 'faq-2',
      question: 'How do you approach performance and latency optimization in web applications?',
      answer: 'I adhere to a measurement-first philosophy. We profile GC allocations, main-thread blocking times, WebGL draw calls, and network waterfalls before touching a line of code. Solutions often involve moving CPU-intensive parsing to Web Workers, using zero-copy ArrayBuffers, and optimizing CSS token delivery.',
      category: 'Technical Architecture',
      isPublished: true,
      order: 2,
    },
    {
      id: 'faq-3',
      question: 'Are you available for international keynote speaking and technical workshops?',
      answer: 'Yes. I regularly speak at international distributed systems and design engineering conferences on topics including consensus safety invariants, WebGL canvas performance, and high-velocity design token pipelines.',
      category: 'Speaking & Workshops',
      isPublished: true,
      order: 3,
    },
    {
      id: 'faq-4',
      question: 'What is your preferred technology stack for greenfield projects?',
      answer: 'For distributed backend systems: Go, Node.js/TypeScript, PostgreSQL, Redis Streams, and Kubernetes. For reactive frontends: TypeScript, React 19, Tailwind CSS, Vite, and Web Audio/WebGL when spatial visualization is required.',
      category: 'Technical Architecture',
      isPublished: true,
      order: 4,
    }
  ],
  customPages: [
    {
      id: 'page-privacy',
      title: 'Privacy Policy & Data Security',
      slug: 'privacy',
      content: 'This portfolio does not utilize third-party ad trackers or invasive analytics cookies. All contact form submissions are encrypted and stored in private administrative database partitions.',
      isPublished: true,
      updatedAt: '2026-10-18T00:00:00.000Z',
    }
  ],
  socialLinks: [
    { id: 'soc-1', platform: 'GitHub', label: 'GitHub', url: 'https://github.com/elena-vance', isEnabled: true, order: 1 },
    { id: 'soc-2', platform: 'LinkedIn', label: 'LinkedIn', url: 'https://linkedin.com/in/elena-vance-eng', isEnabled: true, order: 2 },
    { id: 'soc-3', platform: 'X', label: 'X (Twitter)', url: 'https://x.com/elena_vance_dev', isEnabled: true, order: 3 },
    { id: 'soc-4', platform: 'YouTube', label: 'YouTube Tech Talks', url: 'https://youtube.com/@elena-vance-code', isEnabled: true, order: 4 },
  ],
  contactMessages: [
    {
      id: 'msg-sample-1',
      name: 'Marcus Sterling',
      email: 'm.sterling@stratos-ventures.com',
      subject: 'Keynote Speaker & Architecture Consulting',
      message: 'Hi Elena, I was thoroughly impressed by your telemetry mesh presentation. We are scaling our core infrastructure and would love to discuss a 6-month advisory retainer or keynote engagement at our European CTO Summit.',
      status: 'unread',
      createdAt: '2026-10-15T15:20:00.000Z',
      ipAddress: '198.51.100.42',
    },
    {
      id: 'msg-sample-2',
      name: 'Dr. Sarah Lin',
      email: 'sarah.lin@berkeley.edu',
      subject: 'Collaborative Open-Source Fellowship',
      message: 'Greetings! Our research lab would love to collaborate with you on verifying the Raft consensus safety invariant properties in real-world distributed settings.',
      status: 'read',
      createdAt: '2026-10-12T09:14:00.000Z',
      ipAddress: '136.152.142.10',
    }
  ],
  newsletterSubscribers: [
    { id: 'sub-1', email: 'alex.rivera@techscale.io', subscribedAt: '2026-10-14T11:20:00.000Z', status: 'active' },
    { id: 'sub-2', email: 'dev-lead@quantum-core.org', subscribedAt: '2026-10-16T08:45:00.000Z', status: 'active' },
  ],
  mediaLibrary: [
    {
      id: 'med-1',
      name: 'hero_portrait.jpg',
      originalName: 'hero_portrait.jpg',
      url: '/images/hero_portrait_1792149624424.jpg',
      mimeType: 'image/jpeg',
      size: 428000,
      uploadedAt: '2026-10-16T04:20:00.000Z',
    },
    {
      id: 'med-2',
      name: 'about_workspace.jpg',
      originalName: 'about_workspace.jpg',
      url: '/images/about_workspace_1792149624407.jpg',
      mimeType: 'image/jpeg',
      size: 512000,
      uploadedAt: '2026-10-16T04:20:00.000Z',
    },
    {
      id: 'med-3',
      name: 'project_cloud_arch.jpg',
      originalName: 'project_cloud_arch.jpg',
      url: '/images/project_cloud_arch_1792149624510.jpg',
      mimeType: 'image/jpeg',
      size: 389000,
      uploadedAt: '2026-10-16T04:20:00.000Z',
    },
    {
      id: 'med-4',
      name: 'project_design_system.jpg',
      originalName: 'project_design_system.jpg',
      url: '/images/project_design_system_1792149625333.jpg',
      mimeType: 'image/jpeg',
      size: 440000,
      uploadedAt: '2026-10-16T04:20:00.000Z',
    },
    {
      id: 'med-5',
      name: 'project_audio_neural.jpg',
      originalName: 'project_audio_neural.jpg',
      url: '/images/project_audio_neural_1792149625520.jpg',
      mimeType: 'image/jpeg',
      size: 495000,
      uploadedAt: '2026-10-16T04:20:00.000Z',
    }
  ],
  seoMetadata: {
    metaTitle: 'Elena Vance — Principal Product Engineer & Architect',
    metaDescription: 'High-throughput cloud distributed systems, modern reactive interfaces, and design engineering portfolio of Elena Vance.',
    keywords: ['Principal Engineer', 'Systems Architect', 'TypeScript', 'React 19', 'Distributed Systems', 'Tailwind CSS', 'WebGL'],
    author: 'Elena Vance',
    ogImage: '/images/hero_portrait_1792149624424.jpg',
    canonicalUrl: 'https://elena-vance.dev',
    twitterHandle: '@elena_vance_dev',
  },
  notificationSettings: {
    emailAlerts: true,
    notifyOnNewMessage: true,
    notifyOnResumeDownload: true,
    notificationEmail: 'admin@studio-aetheria.dev',
  },
  analytics: {
    pageViews: 4182,
    uniqueVisitors: 1294,
    sectionViews: {
      home: 4182,
      about: 3240,
      work: 3890,
      skills: 2910,
      experience: 2540,
      services: 1980,
      blog: 2120,
      contact: 1450,
      faq: 1100,
    },
    dailyVisits: [
      { date: '2026-10-12', views: 420 },
      { date: '2026-10-13', views: 512 },
      { date: '2026-10-14', views: 648 },
      { date: '2026-10-15', views: 720 },
      { date: '2026-10-16', views: 810 },
      { date: '2026-10-17', views: 590 },
      { date: '2026-10-18', views: 482 },
    ],
  },
  githubActivity: {
    username: 'elena-vance',
    totalRepos: 38,
    publicGists: 14,
    followers: 492,
    contributionsThisYear: 1842,
    topLanguages: [
      { name: 'TypeScript', percentage: 48 },
      { name: 'Go', percentage: 28 },
      { name: 'Rust', percentage: 14 },
      { name: 'Python', percentage: 10 },
    ],
    recentRepos: [
      {
        name: 'aether-mesh',
        stars: 342,
        forks: 41,
        description: 'Zero-copy WebGL network topology visualizer and telemetry broker.',
        url: 'https://github.com/elena-vance/aether-mesh',
        language: 'TypeScript',
      },
      {
        name: 'raft-sim-go',
        stars: 189,
        forks: 22,
        description: 'Visual raft consensus simulator with asymmetric partition injection.',
        url: 'https://github.com/elena-vance/raft-sim-go',
        language: 'Go',
      },
      {
        name: 'nova-tokens',
        stars: 275,
        forks: 36,
        description: 'Multi-platform design token engine with zero runtime CSS custom properties.',
        url: 'https://github.com/elena-vance/nova-tokens',
        language: 'TypeScript',
      },
    ],
  },
  adminProfile: {
    name: 'Elena Vance (Administrator)',
    email: 'admin@studio-aetheria.dev',
    role: 'Super Administrator',
    avatarUrl: '/images/hero_portrait_1792149624424.jpg',
    lastLogin: '2026-10-18T09:14:00.000Z',
  },
  adminPasswordHash: '782447',
  activityLogs: [
    {
      id: 'log-1',
      action: 'SYSTEM_INITIALIZED',
      details: 'Portfolio database initialized with all 33 content management and security modules.',
      timestamp: '2026-10-18T09:00:00.000Z',
      adminName: 'System Engine',
    },
    {
      id: 'log-2',
      action: 'DATABASE_OPTIMIZED',
      details: 'Persistent file store verified with atomic write synchronization.',
      timestamp: '2026-10-18T09:05:00.000Z',
      adminName: 'System Engine',
    }
  ],
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
        // Deep merge with INITIAL_DATA to ensure newly added section structures exist without overwriting user data
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
          // If existing is an array and has items, keep existing. If empty, keep existing or defaults
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

    // Fix legacy image path references from /src/assets/images/ to /images/
    const fixLegacyUrl = (url: string | undefined): string => {
      if (!url) return '';
      if (url.startsWith('/src/assets/images/')) {
        return url.replace('/src/assets/images/', '/images/');
      }
      return url;
    };

    if (result.home) {
      result.home.profilePhotoUrl = fixLegacyUrl(result.home.profilePhotoUrl);
    }
    if (result.about) {
      result.about.profilePhotoUrl = fixLegacyUrl(result.about.profilePhotoUrl);
    }
    if (result.adminProfile) {
      result.adminProfile.avatarUrl = fixLegacyUrl(result.adminProfile.avatarUrl);
    }
    if (Array.isArray(result.projects)) {
      result.projects = result.projects.map((p) => ({
        ...p,
        thumbnail: fixLegacyUrl(p.thumbnail),
        galleryImages: (p.galleryImages || []).map(fixLegacyUrl),
      }));
    }
    if (Array.isArray(result.mediaLibrary)) {
      result.mediaLibrary = result.mediaLibrary.map((m) => ({
        ...m,
        url: fixLegacyUrl(m.url),
      }));
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
