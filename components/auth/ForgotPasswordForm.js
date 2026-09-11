import { useState } from "react";
import { useRouter } from "next/router";
import { Mail, MailCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import FormField from "@/components/auth/FormField";
import { FormCard, FormTitle, BackLink, DemoNote, SuccessPanel } from "@/components/auth/formBits";
import { ROLES } from "@/components/auth/roles";
import { isEmail, isEmpty } from "@/lib/validators";
import { firebaseSendPasswordReset, mapFirebaseError } from "@/lib/firebase";
import { handleApiError } from "@/lib/api";

export default function ForgotPasswordForm({ role }) {
  const cfg = ROLES[role];
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleChange(value) {
    setEmail(value);
    setError("");
  }

  function validate() {
    if (isEmpty(email)) {
      setError("Email address is required.");
      return false;
    }
    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return false;
    }
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const resetUrl =
        typeof window === "undefined"
          ? ""
          : `${window.location.origin}${cfg.resetPath}`;
      await firebaseSendPasswordReset(email.trim(), { url: resetUrl, handleCodeInApp: true });
      setSent(true);
    } catch (err) {
      setError(err?.code?.startsWith("auth/") ? mapFirebaseError(err) : handleApiError(err));
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    router.push(cfg.loginPath);
  }

  if (sent) {
    return (
      <FormCard>
        <SuccessPanel icon={MailCheck} title="Reset email sent">
          <p className="text-[15px] leading-relaxed text-content-secondary">
            We sent a password reset link to{" "}
            <span className="font-semibold text-content">{email.trim()}</span>. Follow the link in the email to choose a new password.
          </p>
          <div className="mt-2 flex justify-center">
            <Button onClick={handleContinue} size="lg">
              Back to Sign In
            </Button>
          </div>
          <div className="mt-4 flex justify-center">
            <BackLink />
          </div>
        </SuccessPanel>
      </FormCard>
    );
  }

  return (
    <FormCard>
      <FormTitle
        title="Forgot password"
        subtitle="Enter your registered email and we'll send you a secure link to reset your password."
      />

      <form className="mt-6 flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
        <FormField
          id={`${role}-forgot-email`}
          label={cfg.emailLabel}
          type="email"
          required
          value={email}
          onChange={(e) => handleChange(e.target.value)}
          error={error}
          placeholder={cfg.emailPlaceholder}
          autoComplete="email"
          leftIcon={Mail}
        />

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Send Reset Link
        </Button>

        <DemoNote>
          Password reset emails are sent by Firebase Authentication.
        </DemoNote>
      </form>

      <div className="mt-6 flex justify-center">
        <BackLink />
      </div>
    </FormCard>
  );
}