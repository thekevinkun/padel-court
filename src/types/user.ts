export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "user" | "admin";
  created_at: string;
}