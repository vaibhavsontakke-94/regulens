import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AlertCircle, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import FormField from "@/components/auth/FormField";
import PasswordField from "@/components/auth/PasswordField";
import { FormCard, FormTitle, BackLink, DemoNote } from "@/components/auth/formBits";
import { ROLES } from "@/components/auth/roles";
import { isEmail, isEmpty } from "@/lib/validators";
import { setSession, rememberEmail, getRememberedEmail } from "@/lib/authSession";
import { authApi, handleApiError } from "@/lib/api";
import { firebaseSignIn, firebaseUserToSession, mapFirebaseError } from "@/lib/firebase";

function dispNameFromEmail(email) {
  const local = String(email || "").split("@")[0] || "";
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

export default function LoginForm({ role }) {
  const cfg = ROLES[role];
  const router = useRouter();

  const [values, setValues] = useState(() => ({
    email: typeof window === "undefined" ? "" : getRememberedEmail(),
    password: "",
    remember: false,
  }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
    setFormError("");
  }

  function validate() {
    const next = {};
    const email = String(values.email || "").trim();
    if (isEmpty(email)) next.email = "Email address is required.";
    else if (!isEmail(email)) next.email = "Enter a valid email address.";

    if (isEmpty(values.password)) {
      next.password = "Password is required.";
    } else if (String(values.password).length < 8) {
      setFormError("Incorrect email or password.");
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const firebaseUser = await firebaseSignIn(values.email.trim(), values.password);
      const data = await authApi.firebaseSession({
        role,
        email: firebaseUser.email || values.email.trim(),
        name: firebaseUserToSession(firebaseUser, role, values.email.trim()).name,
        uid: firebaseUser.uid,
      });
      if (values.remember) rememberEmail(firebaseUser.email || values.email.trim());
      setSession(data.session);
      router.push(cfg.home);
    } catch (err) {
      setFormError(err?.code?.startsWith("auth/") ? mapFirebaseError(err) : handleApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormCard>
      <FormTitle title={cfg.loginTitle} subtitle={cfg.loginSubtitle} />

      <form className="mt-6 flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
        <FormField
          id={`${cfg.key}-email`}
          label={cfg.emailLabel}
          type="email"
          required
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          error={errors.email}
          placeholder={cfg.emailPlaceholder}
          autoComplete="email"
          leftIcon={Mail}
        />

        <PasswordField
          id={`${cfg.key}-password`}
          label="Password"
          required
          value={values.password}
          onChange={(e) => setField("password", e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-content-secondary select-none">
            <input
              type="checkbox"
              checked={values.remember}
              onChange={(e) => setField("remember", e.target.checked)}
              className="h-4 w-4 rounded border-line accent-primary"
            />
            Remember me
          </label>
          <Link
            href={cfg.forgotPath}
            className="rounded-[8px] text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-ring"
          >
            Forgot password?
          </Link>
        </div>

        {formError && (
          <p role="alert" className="flex items-center gap-1.5 rounded-[10px] border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-2 text-sm text-content-muted">
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
        or
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
      </div>

      <p className="mt-5 text-center text-sm text-content-secondary">
        {cfg.createText}{" "}
        <Link
          href={cfg.registerPath}
          className="font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-ring"
        >
          {cfg.registerCta}
        </Link>
      </p>

      <div className="mt-6">
        <DemoNote>
          Authentication is powered by Firebase. Sign in with an email/password account created in your Firebase project.
        </DemoNote>
      </div>

      <div className="mt-6 flex justify-center">
        <BackLink />
      </div>
    </FormCard>
  );
}