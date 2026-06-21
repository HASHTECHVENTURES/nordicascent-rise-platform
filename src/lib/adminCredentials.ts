/** Dev/demo admin login — sign-in only at /admin/login */
export const HARDCODED_ADMIN_EMAIL = "admin@nordicascent.com";
export const HARDCODED_ADMIN_PASSWORD = "NordicAdmin2026!";

export function isHardcodedAdminCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === HARDCODED_ADMIN_EMAIL.toLowerCase() &&
    password === HARDCODED_ADMIN_PASSWORD
  );
}
