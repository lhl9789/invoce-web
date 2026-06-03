export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  SETTINGS_NOTION: "/settings/notion",
  QUOTE: (slug: string) => `/quote/${slug}`,
} as const
