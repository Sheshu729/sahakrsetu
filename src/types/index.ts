export type UserRole = "owner" | "worker" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar_url: string | null;
  bio: string;
  skills: string[];
  created_at: string;
}

export type JobCategory =
  | "plumbing"
  | "electrical"
  | "carpentry"
  | "painting"
  | "cleaning"
  | "appliance"
  | "other";

export type JobStatus = "open" | "assigned" | "completed" | "cancelled";

export interface JobPost {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: JobCategory;
  budget: number;
  location: string;
  pincode: string;
  media_urls: string[];
  status: JobStatus;
  created_at: string;
  profiles?: Profile;
  applications?: Application[];
}

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface Application {
  id: string;
  job_id: string;
  worker_id: string;
  message: string;
  proposed_rate: number;
  status: ApplicationStatus;
  created_at: string;
  profiles?: Profile;
  job_posts?: JobPost;
}

export interface Review {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: Profile;
}

export interface Conversation {
  id: string;
  job_id: string;
  owner_id: string;
  worker_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  read: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  job_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  razorpay_order_id: string | null;
  created_at: string;
  paid_at: string | null;
}

export const JOB_CATEGORIES: { value: JobCategory; label: string }[] = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "carpentry", label: "Carpentry" },
  { value: "painting", label: "Painting" },
  { value: "cleaning", label: "Cleaning" },
  { value: "appliance", label: "Appliance Repair" },
  { value: "other", label: "Other" },
];

export const STATUS_COLORS: Record<JobStatus | ApplicationStatus, string> = {
  open: "bg-green-500/20 text-green-400",
  assigned: "bg-blue-500/20 text-blue-400",
  completed: "bg-gray-500/20 text-gray-400",
  cancelled: "bg-red-500/20 text-red-400",
  pending: "bg-yellow-500/20 text-yellow-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};
