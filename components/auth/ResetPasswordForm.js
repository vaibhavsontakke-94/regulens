import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { KeyRound } from "lucide-react";
import Button from "@/components/ui/Button";
import PasswordField from "@/components/auth/PasswordField";
import { FormCard, FormTitle, BackLink, SuccessPanel } from "@/components/auth/formBits";
import { ROLES } from "@/components/auth/roles";
import { isEmpty, passwordMeetsAll, requiredError, passwordError } from "@/lib/validators";
import { firebaseConfirmReset, mapFirebaseError } from "@/lib/firebase";
import { handleApiError } from "@/lib/api";
import { clearPendingVerification } from "@/lib/authSession";

export default function ResetPasswordForm({ role }) {
  const cfg = ROLES[role];
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [oobCode, setOobCode] = useState(null);

  useEffect(() => {
    const code = typeof router.query.oobCode === "string" ? router.query.oobCode : "";
    if (!code) {
      setBlocked(true);
      router.replace(cfg.forgotPath);
      return;
    }
    setOobCode(code);
    clearPendingVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.oobCode]);

  function setField(name, value) {
    if (name === "password") setPassword(value);
    else setConfirm(value);
    setErrors((e) => ({ ...e, [name]: "" }));
  }

  function validate() {
    const next = {};
    if (isEmpty(password)) next.password = requiredError("Password");
    else if (!passwordMeetsAll(password)) next.password = passwordError();

    if (isEmpty(confirm)) next.confirm = "Confirm your new password.";
    else if (confirm !== password) next.confirm = "Passwords do not match.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await firebaseConfirmReset(oobCode, password);
      clearPendingVerification();
      setDone(true);
    } catch (err) {
      setErrors((e) => ({ ...e, password: err?.code?.startsWith("auth/") ? mapFirebaseError(err) : handleApiError(err) }));
    } finally {
      setLoading(false);
    }
  }

  if (blocked) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (done) {
    return (
      <FormCard>
        <SuccessPanel icon={KeyRound} title="Password updated">
          <p className="text-[15px] leading-relaxed text-content-secondary">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <div className="mt-2 flex justify-center">
            <Button href={cfg.loginPath} size="lg">
              Return to Sign In
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
        title="Reset password"
        subtitle="Create a new password for your account. It must be at least 8 characters with upper and lower case letters and a number."
      />

      <form className="mt-6 flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
        <PasswordField
          id={`${role}-new-password`}
          label="New Password"
          required
          showStrength
          autoComplete="new-password"
          value={password}
          onChange={(e) => setField("password", e.target.value)}
          error={errors.password}
        />

        <PasswordField
          id={`${role}-confirm-new-password`}
          label="Confirm Password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setField("confirm", e.target.value)}
          error={errors.confirm}
        />

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Reset Password
        </Button>
      </form>

      <div className="mt-6 flex justify-center">
        <BackLink />
      </div>
    </FormCard>
  );
}