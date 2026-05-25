export const PROJECT_CATEGORIES = [
  "SaaS",
  "AI",
  "Inventory",
  "Education",
  "Fintech",
  "Health",
  "Logistics",
  "Developer Tools",
  "Other",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type UserRole = "user" | "admin";
export type ProjectStatus = "pending" | "approved" | "rejected";
export type SortOption = "newest" | "most_viewed" | "most_liked";

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  skills: string[] | null;
  whatsapp: string | null;
  email: string | null;
  social_links: Record<string, string> | null;
  build_score: number;
  role: UserRole;
  is_active: boolean;
  is_builder_of_week: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  short_description: string;
  problem_solved: string;
  category: ProjectCategory;
  tech_stack: string[] | null;
  demo_url: string | null;
  github_url: string | null;
  contact_email: string;
  whatsapp: string | null;
  screenshots: string[] | null;
  views: number;
  likes: number;
  is_featured: boolean;
  status: ProjectStatus;
  rejection_reason: string | null;
  created_at: string;
  profiles?: Profile | null;
}

export interface Activity {
  id: string;
  type: "project_launched" | "project_liked" | "builder_joined";
  user_id: string | null;
  project_id: string | null;
  message: string;
  created_at: string;
}

export interface ProjectWithBuilder extends Project {
  profiles: Profile;
}

export interface LaunchFridaySettings {
  enabled: boolean;
  title: string;
  message: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalLikes: number;
  totalViews: number;
  pendingProjects: number;
}
