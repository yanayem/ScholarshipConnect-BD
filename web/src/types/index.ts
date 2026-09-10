export interface Scholarship {
  id: number;
  title: string;
  provider: string;
  country: string;
  level: string;
  description?: string;
  deadline?: string;
  amount?: string;
  image?: string;
}

export interface Recommendation {
  scholarship: Scholarship;
  match_score: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_pro: boolean;
  avatar?: string;
  is_staff?: boolean;
}

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
