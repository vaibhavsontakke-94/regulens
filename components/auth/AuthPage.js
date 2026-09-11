import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import VerifyForm from "@/components/auth/VerifyForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { ROLES } from "@/components/auth/roles";

const FORMS = {
  login: LoginForm,
  register: RegisterForm,
  forgot: ForgotPasswordForm,
  verify: VerifyForm,
  reset: ResetPasswordForm,
};

const HEADER_TITLES = {
  login: "Sign in",
  register: "Create account",
  forgot: "Forgot password",
  verify: "Verify",
  reset: "Reset password",
};

export default function AuthPage({ role, page }) {
  const cfg = ROLES[role];
  const Form = FORMS[page];

  return (
    <AuthLayout
      roleLabel={cfg.eyebrow}
      headline={cfg.title}
      tagline={cfg.tagline}
      title={`${HEADER_TITLES[page]} · ${cfg.title}`}
    >
      <Form role={role} />
    </AuthLayout>
  );
}