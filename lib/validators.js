export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value) {
  return EMAIL_RE.test(String(value || "").trim());
}

export function isEmpty(value) {
  return String(value ?? "").trim() === "";
}

export function isRequired(value) {
  return !isEmpty(value);
}

export function passwordRequirements(password) {
  const p = String(password || "");
  return {
    length: p.length >= 8,
    upper: /[A-Z]/.test(p),
    lower: /[a-z]/.test(p),
    number: /[0-9]/.test(p),
  };
}

export function passwordMeetsAll(password) {
  const r = passwordRequirements(password);
  return r.length && r.upper && r.lower && r.number;
}

export function passwordStrength(password) {
  const p = String(password || "");
  const r = passwordRequirements(p);
  if (!r.length) return 0;
  let score = 0;
  if (r.lower) score += 1;
  if (r.upper) score += 1;
  if (r.number) score += 1;
  if (p.length >= 12) score += 1;
  return score;
}

export const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];

export function requiredError(label = "This field") {
  return `${label} is required.`;
}

export function emailError() {
  return "Enter a valid email address.";
}

export function passwordError() {
  return "Use 8+ characters with upper & lower case and a number.";
}