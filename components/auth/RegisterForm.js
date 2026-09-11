import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Building2, Mail, User } from "lucide-react";
import Button from "@/components/ui/Button";
import FormField from "@/components/auth/FormField";
import PasswordField from "@/components/auth/PasswordField";
import SelectField from "@/components/auth/SelectField";
import { FormCard, FormTitle, BackLink, SectionLabel } from "@/components/auth/formBits";
import { ROLES } from "@/components/auth/roles";
import { isEmail, isEmpty, passwordMeetsAll, requiredError, emailError, passwordError } from "@/lib/validators";
import { setSession } from "@/lib/authSession";
import { authApi, handleApiError } from "@/lib/api";
import { firebaseSignUp, mapFirebaseError } from "@/lib/firebase";

const INDUSTRIES = [
  "Financial Services",
  "Healthcare",
  "Technology",
  "Manufacturing",
  "Energy & Utilities",
  "Transportation & Logistics",
  "Retail & Consumer",
  "Agriculture",
  "Construction",
  "Other",
];

const FIELD_DEFS = {
  government: [
    { section: "Your details", fields: [
      { name: "fullName", label: "Full Name", type: "text", autoComplete: "name", placeholder: "Amina Yusuf" },
      { name: "email", label: "Official Email", type: "email", autoComplete: "email", placeholder: "name@agency.gov" },
    ]},
    { section: "Organisation details", fields: [
      { name: "department", label: "Department", type: "text", placeholder: "Ministry of Commerce" },
      { name: "designation", label: "Designation", type: "text", placeholder: "Policy Officer" },
      { name: "organization", label: "Organization", type: "text", placeholder: "Regulatory Authority" },
      { name: "govId", label: "Government ID / Reference", type: "text", placeholder: "ID-0024-9910-A" },
    ]},
    { section: "Account security", fields: [] },
  ],
  business: [
    { section: "Your details", fields: [
      { name: "fullName", label: "Full Name", type: "text", autoComplete: "name", placeholder: "James Carter" },
      { name: "businessName", label: "Business Name", type: "text", autoComplete: "organization", placeholder: "Northline Foods Ltd" },
    ]},
    { section: "Business details", fields: [
      { name: "email", label: "Business Email", type: "email", autoComplete: "email", placeholder: "name@company.com" },
      { name: "industry", label: "Industry", type: "select", options: INDUSTRIES, placeholder: "Select your industry" },
      { name: "location", label: "Business Location", type: "text", placeholder: "Lagos, Nigeria" },
    ]},
    { section: "Account security", fields: [] },
  ],
};

const EMAIL_LABELS = { government: "Official Email", business: "Business Email" };

export default function RegisterForm({ role }) {
  const cfg = ROLES[role];
  const router = useRouter();

  const [values, setValues] = useState({
    fullName: "",
    businessName: "",
    email: "",
    department: "",
    designation: "",
    organization: "",
    govId: "",
    industry: "",
    location: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  }

  function validate() {
    const next = {};
    const isGov = role === "government";

    if (isEmpty(values.fullName)) next.fullName = requiredError("Full name");
    if (!isGov && isEmpty(values.businessName)) next.businessName = requiredError("Business name");

    const email = String(values.email || "").trim();
    if (isEmpty(email)) next.email = requiredError(EMAIL_LABELS[role]);
    else if (!isEmail(email)) next.email = emailError();

    if (isGov) {
      if (isEmpty(values.department)) next.department = requiredError("Department");
      if (isEmpty(values.designation)) next.designation = requiredError("Designation");
      if (isEmpty(values.organization)) next.organization = requiredError("Organization");
      if (isEmpty(values.govId)) next.govId = requiredError("Government ID");
    } else {
      if (isEmpty(values.industry)) next.industry = "Select an industry.";
      if (isEmpty(values.location)) next.location = requiredError("Business location");
    }

    if (isEmpty(values.password)) next.password = requiredError("Password");
    else if (!passwordMeetsAll(values.password)) next.password = passwordError();

    if (isEmpty(values.confirm)) next.confirm = "Confirm your password.";
    else if (values.confirm !== values.password) next.confirm = "Passwords do not match.";

    if (!values.terms) next.terms = "You must accept the terms to continue.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (values.password !== values.confirm) {
      setErrors((e) => ({ ...e, confirm: "Passwords do not match." }));
      return;
    }
    if (!validate()) return;
    setLoading(true);
    setFormError("");
    try {
      const firebaseUser = await firebaseSignUp({
        email: values.email.trim(),
        password: values.password,
        name: values.fullName.trim(),
      });
      const data = await authApi.firebaseSession({
        role,
        email: values.email.trim(),
        name: values.fullName.trim(),
        uid: firebaseUser.uid,
      });
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
      <FormTitle
        title={`Create a ${role === "government" ? "Government" : "Business"} Account`}
        subtitle="Register to access your intelligence workspace."
      />

      <form className="mt-6 flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
        {FIELD_DEFS[role].map((group) => (
          <div key={group.section} className="flex flex-col gap-4">
            <SectionLabel>{group.section}</SectionLabel>

            <div className="flex flex-col gap-4">
              {group.fields.map((field) => {
                const common = {
                  id: `${role}-${field.name}`,
                  label: field.label,
                  required: true,
                  value: values[field.name],
                  error: errors[field.name],
                  onChange: (e) => setField(field.name, e.target.value),
                };

                if (field.type === "select") {
                  return (
                    <SelectField
                      key={field.name}
                      {...common}
                      options={field.options}
                      placeholder={field.placeholder}
                    />
                  );
                }

                const leftIcon =
                  field.type === "email" ? Mail : field.name === "fullName" || field.name === "businessName" ? User : undefined;

                return (
                  <FormField
                    key={field.name}
                    {...common}
                    type={field.type}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    leftIcon={leftIcon}
                  />
                );
              })}

              {group.section === "Account security" && (
                <>
                  <PasswordField
                    id={`${role}-password`}
                    label="Password"
                    required
                    showStrength
                    autoComplete="new-password"
                    value={values.password}
                    onChange={(e) => setField("password", e.target.value)}
                    error={errors.password}
                  />
                  <PasswordField
                    id={`${role}-confirm`}
                    label="Confirm Password"
                    required
                    autoComplete="new-password"
                    value={values.confirm}
                    onChange={(e) => setField("confirm", e.target.value)}
                    error={errors.confirm}
                  />
                </>
              )}
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-content-secondary select-none">
            <input
              type="checkbox"
              checked={values.terms}
              onChange={(e) => setField("terms", e.target.checked)}
              aria-invalid={errors.terms ? true : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-primary"
            />
            <span>
              I have read and agree to the{" "}
              <Link href="/terms" className="font-medium text-primary hover:text-primary-hover">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-primary hover:text-primary-hover">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.terms && (
            <p role="alert" className="flex items-center gap-1 text-[13px] font-medium text-danger">
              {errors.terms}
            </p>
          )}
        </div>

        {formError && (
          <p role="alert" className="flex items-center gap-1.5 rounded-[10px] border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger">
            {formError}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            <Building2 className="h-4 w-4" aria-hidden="true" />
            {role === "government" ? "Create Account" : "Create Business Account"}
          </Button>
          <p className="text-center text-sm text-content-secondary">
            Already have an account?{" "}
            <Link
              href={cfg.loginPath}
              className="font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>

      <div className="mt-6 flex justify-center">
        <BackLink />
      </div>
    </FormCard>
  );
}