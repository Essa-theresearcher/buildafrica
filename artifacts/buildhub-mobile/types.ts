export type ReputationTag =
  | "Verified Builder"
  | "Shipped Project"
  | "Reliable Collaborator"
  | "Available for Work"
  | "Coffee & Code Member";

export type ProjectStatus = "Idea" | "Building" | "Launched" | "Verified";

export interface Endorsement {
  fromId: string;
  note: string;
}

export interface Builder {
  id: string;
  name: string;
  username: string;
  avatar: string;
  location: string;
  role: string;
  skills: string[];
  bio: string;
  availability: "Available" | "Limited" | "Unavailable";
  verificationStatus: "Verified" | "Pending" | "Unverified";
  tags: ReputationTag[];
  projectIds: string[];
  collaborators: string[];
  endorsements?: Endorsement[];
  contact: string;
  joinedAt: string;
  adminNotes?: string;
}

export interface ProjectScreenshot {
  url: string;
  alt: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  builderIds: string[];
  techStack: string[];
  status: ProjectStatus;
  link?: string;
  repoUrl?: string;
  videoUrl?: string;
  screenshots?: ProjectScreenshot[];
  contribution: string;
  featured: boolean;
  createdAt: string;
}

export interface CompanyRequest {
  id: string;
  companyName: string;
  roleNeeded: string;
  skillsRequired: string[];
  budgetRange: string;
  remote: boolean;
  location?: string;
  timeline: string;
  contactEmail: string;
  submittedAt: string;
  matchedBuilderIds?: string[];
  adminNotes?: string;
  status: "New" | "Reviewed" | "Matched" | "Closed";
}
