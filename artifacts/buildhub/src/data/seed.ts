import type { Builder, Project, CompanyRequest } from "../types";

export const builders: Builder[] = [
  {
    id: "b1",
    name: "David Kamau",
    username: "dkamau",
    avatar: "",
    location: "Nairobi, Kenya",
    role: "Fullstack Developer",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "AWS"],
    bio: "I build production-grade SaaS tools. 4 years shipping real products for startups across East Africa. I focus on clean code and fast delivery.",
    availability: "Available",
    verificationStatus: "Verified",
    tags: ["Verified Builder", "Shipped Project", "Reliable Collaborator", "Coffee & Code Member"],
    projectIds: ["p1", "p2"],
    collaborators: ["b2", "b3"],
    contact: "david@example.co.ke",
    joinedAt: "2024-03-10",
    adminNotes: "Excellent communicator. Delivered Sokoni on time with great docs.",
  },
  {
    id: "b2",
    name: "Amina Odhiambo",
    username: "aminabuilds",
    avatar: "",
    location: "Nairobi, Kenya",
    role: "Product Designer & Frontend Dev",
    skills: ["Figma", "React", "Tailwind CSS", "UX Research", "Framer"],
    bio: "I turn complex problems into clean interfaces. Shipped 6 products with African teams. Passionate about accessibility and mobile-first design.",
    availability: "Limited",
    verificationStatus: "Verified",
    tags: ["Verified Builder", "Shipped Project", "Available for Work"],
    projectIds: ["p2", "p3"],
    collaborators: ["b1"],
    contact: "amina@example.co.ke",
    joinedAt: "2024-04-02",
  },
  {
    id: "b3",
    name: "Brian Otieno",
    username: "brianbuilds",
    avatar: "",
    location: "Nairobi, Kenya",
    role: "Backend Engineer",
    skills: ["Python", "Django", "FastAPI", "Redis", "Docker", "PostgreSQL"],
    bio: "Backend specialist who has shipped payment integrations, logistics APIs, and fintech backends. I obsess over reliability and performance.",
    availability: "Available",
    verificationStatus: "Verified",
    tags: ["Verified Builder", "Shipped Project", "Reliable Collaborator", "Coffee & Code Member", "Available for Work"],
    projectIds: ["p1", "p4"],
    collaborators: ["b1", "b4"],
    contact: "brian@example.co.ke",
    joinedAt: "2024-02-20",
    adminNotes: "Very reliable. Has handled multiple high-traffic systems.",
  },
  {
    id: "b4",
    name: "Grace Wanjiku",
    username: "gracewanjiku",
    avatar: "",
    location: "Nairobi, Kenya",
    role: "Mobile Developer",
    skills: ["React Native", "Expo", "Flutter", "Firebase", "TypeScript"],
    bio: "Building mobile apps that actually work in low-bandwidth environments. Shipped 3 consumer apps with 10k+ downloads across Kenya and Uganda.",
    availability: "Available",
    verificationStatus: "Verified",
    tags: ["Verified Builder", "Shipped Project", "Available for Work"],
    projectIds: ["p3"],
    collaborators: ["b2"],
    contact: "grace@example.co.ke",
    joinedAt: "2024-05-15",
  },
  {
    id: "b5",
    name: "Kevin Mwangi",
    username: "kevinmwangi",
    avatar: "",
    location: "Nairobi, Kenya",
    role: "Data Engineer",
    skills: ["Python", "dbt", "BigQuery", "Airflow", "Spark"],
    bio: "Data pipelines and analytics infrastructure for growing African startups. Helped 4 companies move off spreadsheets to proper BI systems.",
    availability: "Unavailable",
    verificationStatus: "Pending",
    tags: ["Shipped Project", "Coffee & Code Member"],
    projectIds: ["p5"],
    collaborators: [],
    contact: "kevin@example.co.ke",
    joinedAt: "2024-06-01",
  },
  {
    id: "b6",
    name: "Naomi Njoroge",
    username: "naomi_builds",
    avatar: "",
    location: "Nairobi, Kenya",
    role: "Fullstack Developer",
    skills: ["Next.js", "Supabase", "Tailwind", "TypeScript", "Stripe"],
    bio: "Focused on SaaS and marketplace products. Two exits from projects I built and co-founded. I care deeply about shipping and iterating fast.",
    availability: "Available",
    verificationStatus: "Verified",
    tags: ["Verified Builder", "Shipped Project", "Reliable Collaborator", "Available for Work", "Coffee & Code Member"],
    projectIds: ["p5", "p6"],
    collaborators: ["b1", "b3"],
    contact: "naomi@example.co.ke",
    joinedAt: "2024-01-15",
    adminNotes: "One of the most reliable builders. Has mentored 3 others.",
  },
];

export const projects: Project[] = [
  {
    id: "p1",
    slug: "sokoni-market",
    name: "Sokoni Market",
    description: "A B2B marketplace connecting small retailers in Nairobi with wholesale distributors. Handles inventory sync, bulk ordering, and mobile money payments via M-Pesa.",
    builderIds: ["b1", "b3"],
    techStack: ["React", "Node.js", "PostgreSQL", "M-Pesa API", "Redis"],
    status: "Verified",
    link: "https://sokonimarket.co.ke",
    contribution: "David built the entire frontend and order management system. Brian handled the payments integration and API layer.",
    featured: true,
    createdAt: "2024-03-20",
  },
  {
    id: "p2",
    slug: "afya-connect",
    name: "Afya Connect",
    description: "Telemedicine platform allowing patients in underserved areas to consult doctors via video and text. Integrated with NHIF for covered consultations.",
    builderIds: ["b1", "b2"],
    techStack: ["React", "WebRTC", "Django", "Figma", "PostgreSQL"],
    status: "Launched",
    link: "https://afyaconnect.co.ke",
    contribution: "Amina led the full design and frontend. David built the booking engine and video call integration.",
    featured: true,
    createdAt: "2024-04-10",
  },
  {
    id: "p3",
    slug: "duka-app",
    name: "Duka App",
    description: "Mobile-first inventory and sales tracking app for Nairobi's small shop owners. Works offline and syncs when connectivity is restored.",
    builderIds: ["b2", "b4"],
    techStack: ["React Native", "Expo", "SQLite", "Figma", "Firebase"],
    status: "Launched",
    link: "https://dukaapp.co.ke",
    contribution: "Grace built the mobile app with offline-first architecture. Amina designed the entire UX and icon system.",
    featured: false,
    createdAt: "2024-05-18",
  },
  {
    id: "p4",
    slug: "riskboard",
    name: "RiskBoard",
    description: "Credit risk assessment dashboard for Kenyan microfinance institutions. Aggregates mobile money history, social signals, and business data to produce risk scores.",
    builderIds: ["b3"],
    techStack: ["FastAPI", "PostgreSQL", "Docker", "React", "Nginx"],
    status: "Launched",
    link: "",
    contribution: "Brian architected and built the entire system solo, including the risk scoring engine and REST API.",
    featured: true,
    createdAt: "2024-02-25",
  },
  {
    id: "p5",
    slug: "nauli-saas",
    name: "Nauli SaaS",
    description: "Fleet management SaaS for matatu operators in Nairobi. Tracks revenue, expenses, driver performance, and route profitability in real time.",
    builderIds: ["b5", "b6"],
    techStack: ["Next.js", "Supabase", "dbt", "BigQuery", "Stripe"],
    status: "Building",
    link: "",
    contribution: "Naomi owns the full product and frontend. Kevin built the data pipeline that powers the analytics dashboard.",
    featured: false,
    createdAt: "2024-06-05",
  },
  {
    id: "p6",
    slug: "fundis-hub",
    name: "Fundis Hub",
    description: "Vetted marketplace for skilled tradespeople (fundis) in Nairobi. Homeowners can book verified plumbers, electricians, and carpenters with real reviews.",
    builderIds: ["b6"],
    techStack: ["Next.js", "Supabase", "Stripe", "Tailwind", "TypeScript"],
    status: "Verified",
    link: "https://fundishub.co.ke",
    contribution: "Naomi designed, built, and launched the entire platform. Handles bookings, payments, and review verification.",
    featured: true,
    createdAt: "2024-01-20",
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
    adminNotes: "Brian is a perfect fit. Intro sent June 12.",
  },
  {
    id: "cr2",
    companyName: "Twiga Foods",
    roleNeeded: "Mobile Developer",
    skillsRequired: ["React Native", "Offline-first", "Firebase"],
    budgetRange: "$2,500–$4,000/month",
    remote: true,
    timeline: "2-month project",
    contactEmail: "hiring@twigafoods.com",
    submittedAt: "2024-06-15",
    status: "Reviewed",
  },
  {
    id: "cr3",
    companyName: "Pezesha",
    roleNeeded: "Fullstack Developer (Fintech)",
    skillsRequired: ["React", "Node.js", "M-Pesa", "TypeScript"],
    budgetRange: "$4,000–$7,000/month",
    remote: false,
    location: "Nairobi",
    timeline: "Full-time hire preferred",
    contactEmail: "cto@pezesha.com",
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
