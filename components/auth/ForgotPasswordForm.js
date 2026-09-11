import { useState } from "react";
import { useRouter } from "next/router";
import { Mail, MailCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import FormField from "@/components/auth/FormField";
import { FormCard, FormTitle, BackLink, DemoNote, SuccessPanel } from "@/components/auth/formBits";
import { ROLES } from "@/components/auth/roles";
import { isEmail, isEmpty } from "@/lib/validators";
import { setPendingVerification } from "@/lib/authSession";
import { authApi, handleApiError } from "@/lib/api";

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
      await authApi.forgotPassword({ role, email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    setPendingVerification({ role, email: email.trim(), purpose: "reset" });
    router.push(cfg.verifyPath);
  }

  if (sent) {
    return (
      <FormCard>
        <SuccessPanel icon={MailCheck} title="Verification code sent">
          <p className="text-[15px] leading-relaxed text-content-secondary">
            We sent a 6-digit verification code to{" "}
            <span className="font-semibold text-content">{email.trim()}</span>.
          </p>
          <div className="mt-2 flex justify-center">
            <Button onClick={handleContinue} size="lg">
              Enter verification code
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
        subtitle="Enter your registered email and we'll send you a verification code to reset your password."
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
          Send Verification Code
        </Button>

        <DemoNote>
          Demo mode: the reset code is returned by the API (and shown in your dev server logs).
        </DemoNote>
      </form>

      <div className="mt-6 flex justify-center">
        <BackLink />
      </div>
    </FormCard>
  );
}