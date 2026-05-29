import type { Builder, Project, CompanyRequest } from "@/types";

export const builders: Builder[] = [
  {
    id: "b1",
    name: "Omar Issa",
    username: "omarissa",
    avatar: "",
    location: "Nairobi, Kenya",
    role: "Fullstack Developer",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "M-Pesa API"],
    bio: "Shipped 5 production products for East African startups. I specialize in fintech and marketplace tools — systems that need to be fast, reliable, and work on low-bandwidth networks.",
    availability: "Available",
    verificationStatus: "Verified",
    tags: ["Verified Builder", "Shipped Project", "Reliable Collaborator", "Coffee & Code Member"],
    projectIds: ["p1", "p2"],
    collaborators: ["b2", "b3"],
    endorsements: [
      { fromId: "b3", note: "Omar delivered the entire inventory module ahead of schedule with full documentation. Clear communicator from day one — I always knew where things stood." },
      { fromId: "b2", note: "The cleanest handoff I've worked with. He built the backend exactly to spec and was available whenever I had design questions." },
    ],
    contact: "omar@example.so",
    joinedAt: "2024-02-10",
    adminNotes: "One of the founding Coffee & Code members. Has delivered every contract on time with clean handoffs.",
  },
  {
    id: "b2",
    name: "Amina Ali",
    username: "aminaali",
    avatar: "",
    location: "Nairobi, Kenya",
    role: "Product Designer & Frontend Dev",
    skills: ["Figma", "React", "Tailwind CSS", "UX Research", "Framer"],
    bio: "I design and build interfaces that work for real African users — offline-tolerant, mobile-first, and actually usable in the field. Shipped 4 products across Kenya and Somalia.",
    availability: "Limited",
    verificationStatus: "Verified",
    tags: ["Verified Builder", "Shipped Project", "Available for Work", "Coffee & Code Member"],
    projectIds: ["p2", "p3"],
    collaborators: ["b1", "b4"],
    endorsements: [
      { fromId: "b4", note: "Amina's design handoffs are immaculate — every screen annotated, every edge case documented. She stayed until it was right, not just until it was done." },
      { fromId: "b1", note: "Built a telemedicine UI from scratch in 3 weeks. Zero back-and-forth on revisions because she asks the right questions upfront." },
    ],
    contact: "amina@example.so",
    joinedAt: "2024-03-05",
    adminNotes: "Strong design instincts. Ships fast and communicates clearly.",
  },
  {
    id: "b3",
    name: "Ibrahim Hassan",
    username: "ibrahimhassan",
    avatar: "",
    location: "Mogadishu, Somalia",
    role: "Backend Engineer",
    skills: ["Python", "Django", "FastAPI", "PostgreSQL", "Docker", "Redis"],
    bio: "Backend engineer building APIs and data systems for East African startups. Shipped payment integrations, logistics backends, and school management systems from Mogadishu.",
    availability: "Available",
    verificationStatus: "Verified",
    tags: ["Verified Builder", "Shipped Project", "Reliable Collaborator"],
    projectIds: ["p1", "p4"],
    collaborators: ["b1", "b5"],
    endorsements: [
      { fromId: "b1", note: "Ibrahim went from zero to production-ready API in under 2 weeks. His systems handle load well — the InventoryPro API has had zero downtime since launch." },
      { fromId: "b5", note: "Solid remote collaborator. Works East Africa hours reliably, responds fast, and documents everything. I'd work with him again immediately." },
    ],
    contact: "ibrahim@example.so",
    joinedAt: "2024-02-28",
    adminNotes: "Very reliable. Has handled high-traffic production systems. Based in Mogadishu, works East Africa hours consistently.",
  },
  {
    id: "b4",
    name: "Fadumo Noor",
    username: "fadumoo",
    avatar: "",
    location: "Nairobi, Kenya",
    role: "Mobile Developer",
    skills: ["React Native", "Expo", "Flutter", "Firebase", "SQLite"],
    bio: "Building mobile apps that work in low-bandwidth, offline-first environments across East Africa. My apps have been used in schools, clinics, and warehouses with no reliable internet.",
    availability: "Available",
    verificationStatus: "Verified",
    tags: ["Verified Builder", "Shipped Project", "Available for Work", "Coffee & Code Member"],
    projectIds: ["p3", "p5"],
    collaborators: ["b2"],
    endorsements: [
      { fromId: "b2", note: "Offline-first mobile is her superpower. She shipped the SchoolFlow app two weeks early and it worked flawlessly in zero-connectivity schools in rural Kenya." },
    ],
    contact: "fadumo@example.co.ke",
    joinedAt: "2024-04-12",
    adminNotes: "Excellent offline-first architecture skills. Delivered CargoTrack mobile app ahead of schedule.",
  },
  {
    id: "b5",
    name: "Yahye Mohamed",
    username: "yahyebuilds",
    avatar: "",
    location: "Mogadishu, Somalia",
    role: "Fullstack Developer",
    skills: ["Next.js", "Supabase", "TypeScript", "Stripe", "Tailwind CSS"],
    bio: "Shipped SaaS and marketplace products from Mogadishu. Two co-founded projects currently live. I care about speed of execution and clean code that the next person can maintain.",
    availability: "Available",
    verificationStatus: "Verified",
    tags: ["Verified Builder", "Shipped Project", "Reliable Collaborator", "Coffee & Code Member"],
    projectIds: ["p5", "p6"],
    collaborators: ["b3", "b1"],
    endorsements: [
      { fromId: "b3", note: "Yahye is a consistent shipper. He built Fundis Hub solo and launched it. No hand-holding needed — just give him the brief and get out of the way." },
      { fromId: "b1", note: "Works fast and clean. The ClipCraft subscription system he built is well-structured enough that I could maintain it without him." },
    ],
    contact: "yahye@example.so",
    joinedAt: "2024-01-20",
    adminNotes: "Founding member. Has mentored 2 other builders. Ships consistently.",
  },
  {
    id: "b6",
    name: "Grace Wanjiku",
    username: "gracewanjiku",
    avatar: "",
    location: "Nairobi, Kenya",
    role: "Data Engineer",
    skills: ["Python", "dbt", "BigQuery", "Airflow", "PostgreSQL"],
    bio: "Data pipelines and analytics infrastructure for East African startups moving off spreadsheets. Helped 3 companies build real BI systems from scratch.",
    availability: "Unavailable",
    verificationStatus: "Pending",
    tags: ["Shipped Project", "Coffee & Code Member"],
    projectIds: ["p4"],
    collaborators: [],
    contact: "grace@example.co.ke",
    joinedAt: "2024-05-30",
  },
];

export const projects: Project[] = [
  {
    id: "p1",
    slug: "inventorypro",
    name: "InventoryPro",
    description: "Inventory management SaaS for small and mid-size retailers across East Africa. Real-time stock tracking, low-stock alerts, supplier management, and M-Pesa-integrated purchase orders.",
    builderIds: ["b1", "b3"],
    techStack: ["React", "Node.js", "PostgreSQL", "M-Pesa API", "Redis"],
    status: "Verified",
    link: "https://inventorypro.co.ke",
    repoUrl: "https://github.com/coffeeandcode/inventorypro",
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    screenshots: [
      { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80", alt: "InventoryPro stock dashboard with real-time analytics" },
      { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80", alt: "Sales and revenue reporting view" },
      { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80", alt: "Purchase order and supplier management screen" },
    ],
    contribution: "Omar built the entire frontend dashboard and order management system. Ibrahim architected the API layer and real-time stock sync engine.",
    featured: true,
    createdAt: "2024-02-20",
  },
  {
    id: "p2",
    slug: "hirematch-ai",
    name: "HireMatch AI",
    description: "Local talent matching platform for East African companies. Matches companies to verified candidates based on skills and project history — not LinkedIn connections or CV buzzwords.",
    builderIds: ["b1", "b2"],
    techStack: ["React", "Django", "PostgreSQL", "Figma", "OpenAI API"],
    status: "Launched",
    link: "https://hirematch.africa",
    repoUrl: "https://github.com/coffeeandcode/hirematch-ai",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    screenshots: [
      { url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80", alt: "HireMatch AI candidate matching results" },
      { url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80", alt: "Company hiring dashboard with shortlists" },
    ],
    contribution: "Amina led the full product design and frontend. Omar built the matching engine and company-side dashboard.",
    featured: true,
    createdAt: "2024-04-05",
  },
  {
    id: "p3",
    slug: "schoolflow",
    name: "SchoolFlow",
    description: "School management system for low-infrastructure schools across Kenya and Somalia. Handles student records, fees, attendance, and teacher schedules — works fully offline.",
    builderIds: ["b2", "b4"],
    techStack: ["React Native", "Expo", "SQLite", "Figma", "Firebase"],
    status: "Launched",
    link: "https://schoolflow.app",
    repoUrl: "https://github.com/coffeeandcode/schoolflow",
    screenshots: [
      { url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80", alt: "SchoolFlow classroom roster and attendance" },
      { url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80", alt: "Student records and fee tracking screen" },
    ],
    contribution: "Fadumo built the mobile app with offline-first sync architecture. Amina designed every screen and the onboarding flow.",
    featured: false,
    createdAt: "2024-05-10",
  },
  {
    id: "p4",
    slug: "cargotrack",
    name: "CargoTrack",
    description: "Logistics tracking dashboard for freight companies moving goods across East Africa. Real-time fleet visibility, delivery confirmation, and route optimization for cross-border shipments.",
    builderIds: ["b3", "b6"],
    techStack: ["FastAPI", "PostgreSQL", "Docker", "React", "dbt"],
    status: "Launched",
    link: "",
    repoUrl: "https://github.com/coffeeandcode/cargotrack",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    screenshots: [
      { url: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=80", alt: "CargoTrack live fleet map with shipment routes" },
      { url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80", alt: "Delivery confirmation and cargo manifest view" },
    ],
    contribution: "Ibrahim built the tracking API and fleet management backend. Grace designed the analytics pipeline that powers route profitability reports.",
    featured: true,
    createdAt: "2024-03-15",
  },
  {
    id: "p5",
    slug: "clipcraft",
    name: "ClipCraft",
    description: "Video content creation tool for East African creators and SMEs. Makes it easy to produce branded short-form video without a production team. Used by 40+ small businesses.",
    builderIds: ["b4", "b5"],
    techStack: ["Next.js", "Supabase", "FFmpeg", "Tailwind CSS", "Stripe"],
    status: "Building",
    link: "",
    repoUrl: "https://github.com/coffeeandcode/clipcraft",
    screenshots: [
      { url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80", alt: "ClipCraft video editor timeline" },
    ],
    contribution: "Yahye owns the full product and subscription flow. Fadumo built the mobile capture and upload experience.",
    featured: false,
    createdAt: "2024-06-01",
  },
  {
    id: "p6",
    slug: "fundis-hub",
    name: "Fundis Hub",
    description: "Vetted marketplace for skilled tradespeople (fundis) in Nairobi. Homeowners can book verified plumbers, electricians, and carpenters with community-verified reviews.",
    builderIds: ["b5"],
    techStack: ["Next.js", "Supabase", "Stripe", "Tailwind CSS", "TypeScript"],
    status: "Verified",
    link: "https://fundishub.co.ke",
    repoUrl: "https://github.com/coffeeandcode/fundis-hub",
    videoUrl: "https://www.loom.com/share/0d2b3f4a5c6d7e8f9a0b1c2d3e4f5a6b",
    screenshots: [
      { url: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80", alt: "Fundis Hub tradesperson booking screen" },
      { url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80", alt: "Verified fundi profile with community reviews" },
      { url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80", alt: "Booking confirmation and payment screen" },
    ],
    contribution: "Yahye designed, built, and launched the full platform — bookings, payments, fundi onboarding, and review verification. Built and shipped solo.",
    featured: true,
    createdAt: "2024-01-25",
  },
];

export const companyRequests: CompanyRequest[] = [
  {
    id: "cr1",
    companyName: "Lipa Later",
    roleNeeded: "Senior Backend Engineer",
    skillsRequired: ["Node.js", "PostgreSQL", "Payments", "REST APIs"],
    budgetRange: "$3,000–$5,000/month",
    remote: false,
    location: "Nairobi",
    timeline: "Start immediately, 6-month contract",
    contactEmail: "tech@lipalater.com",
    submittedAt: "2024-06-10",
    matchedBuilderIds: ["b3"],
    status: "Matched",
    adminNotes: "Ibrahim is the right fit — solid fintech background. Intro sent June 12.",
  },
  {
    id: "cr2",
    companyName: "Dalsan Logistics",
    roleNeeded: "Mobile Developer",
    skillsRequired: ["React Native", "Offline-first", "Firebase"],
    budgetRange: "$2,500–$4,000/month",
    remote: true,
    timeline: "2-month project",
    contactEmail: "tech@dalsan.so",
    submittedAt: "2024-06-15",
    status: "Reviewed",
    adminNotes: "Fadumo is a strong match for offline-first work. Following up.",
  },
  {
    id: "cr3",
    companyName: "Hormuud Telkom",
    roleNeeded: "Fullstack Developer (Fintech)",
    skillsRequired: ["React", "Node.js", "M-Pesa", "TypeScript"],
    budgetRange: "$4,000–$7,000/month",
    remote: false,
    location: "Mogadishu",
    timeline: "Full-time hire preferred",
    contactEmail: "devhiring@hormuud.so",
    submittedAt: "2024-06-18",
    status: "New",
  },
];

export function getBuilderById(id: string): Builder | undefined {
  return builders.find((b) => b.id === id);
}

export function getBuilderByUsername(username: string): Builder | undefined {
  return builders.find((b) => b.username === username);
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getProjectsByBuilderIds(ids: string[]): Project[] {
  return projects.filter((p) => p.builderIds.some((bid) => ids.includes(bid)));
}

export function getBuildersByIds(ids: string[]): Builder[] {
  return builders.filter((b) => ids.includes(b.id));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
