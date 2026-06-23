// ─── App Types ───────────────────────────────────────────────────────────────

export type View =
  | "landing"
  | "catalog"
  | "classroom"
  | "certificate"
  | "b2b"
  | "validate"
  | "login"
  | "register"
  | "b2b-register"
  | "my-panel"
  | "my-profile"
  | "my-certificates"
  | "admin";

export type AdminSection =
  | "dashboard"
  | "courses"
  | "course-editor"
  | "certificates"
  | "clients"
  | "areas"
  | "metrics"
  | "settings"
  | "coupons"
  | "plans";

export interface AppUser {
  name: string;
  email: string;
  role: "student" | "admin" | "hr" | "company";
  company?: string;
  companyId?: number;
  permissions?: string; // JSON string from DB
  cpf?: string;
  phone?: string;
  avatarUrl?: string;
}
