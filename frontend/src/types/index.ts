// The User object we get from the Django API after logging in
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

// The AuthTokens object we get from the Django API
export interface AuthTokens {
  access: string;
  refresh: string;
}

// Todo object from Django model
export interface Todo {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}
