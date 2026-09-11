import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import CodeInput from "@/components/auth/CodeInput";
import { FormCard, FormTitle, BackLink, DemoNote } from "@/components/auth/formBits";
import { ROLES } from "@/components/auth/roles";
import { getPendingVerification, clearPendingVerification, setSession } from "@/lib/authSession";
import useCountdown from "@/hooks/useCountdown";
import { authApi, handleApiError } from "@/lib/api";

const RESEND_SECONDS = 30;

function maskEmail(email) {
  const [local, domain] = String(email || "").split("@");
  if (!local) return email;
  const head = local.slice(0, 2);
  const tail = local.length > 2 ? local.slice(-2) : local.slice(-1);
  return `${head}${"*".repeat(Math.max(local.length - 4, 2))}${tail}@${domain || ""}`;
}

export default function VerifyForm({ role }) {
  const cfg = ROLES[role];
  const router = useRouter();

  const [pending, setPending] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendNote, setResendNote] = useState("");
  const { seconds, reset } = useCountdown(RESEND_SECONDS);

  useEffect(() => {
    const value = getPendingVerification();
    if (!value || value.role !== role) {
      router.replace(cfg.forgotPath);
      return;
    }
    setPending(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  if (!pending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" role="status" aria-label="Loading" />
      </div>
    );
  }

  function handleResend() {
    reset();
    setCode("");
    setError("");
    setResendNote("");
    authApi
      .resendCode({ role, email: pending.email })
      .then(() => setResendNote(`A new code was sent to ${maskEmail(pending.email)}.`))
      .catch((err) => setError(handleApiError(err)));
  }

  function handleChange(value) {
    setCode(value);
    setError("");
    setResendNote("");
  }

  async function handleVerify() {
    if (code.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setLoading(true);
    setError("");
    setResendNote("");
    try {
      const data = await authApi.verify({
        role,
        email: pending.email,
        code,
        name: pending.name,
        purpose: pending.purpose,
      });
      clearPendingVerification();
      if (pending.purpose === "register") {
        setSession(data.session);
        router.push(cfg.home);
      } else {
        router.push(cfg.resetPath);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }

  const canResend = seconds <= 0;

  return (
    <FormCard>
      <FormTitle
        title="Enter verification code"
        subtitle={`We sent a 6-digit code to ${maskEmail(pending.email)}.`}
      />

      <div className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${role}-code`} className="text-sm font-medium text-content">
            Verification code
          </label>
          <div className="flex flex-col gap-2">
            <CodeInput value={code} onChange={handleChange} error={error} />
            <span className="sr-only" aria-live="polite">
              {code.length} of 6 digits entered
            </span>
          </div>
          {error && (
            <p id={`${role}-code-error`} role="alert" className="text-[13px] font-medium text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className="rounded-[8px] font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canResend ? "Resend code" : `Resend code in 0:${String(seconds).padStart(2, "0")}`}
          </button>
          {resendNote && (
            <span role="status" className="text-xs font-medium text-success">
              {resendNote}
            </span>
          )}
        </div>

        <Button onClick={handleVerify} size="lg" className="w-full" loading={loading}>
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Verify
        </Button>

        <DemoNote>Check your inbox for the 6-digit code. In development the code is also returned in the API response.</DemoNote>
      </div>

      <div className="mt-6 flex justify-center">
        <BackLink />
      </div>
    </FormCard>
  );
}