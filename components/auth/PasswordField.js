import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import FormField from "@/components/auth/FormField";
import PasswordStrength from "@/components/auth/PasswordStrength";

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  showStrength = false,
  autoComplete = "current-password",
  ...props
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <FormField
        id={id}
        label={label}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        error={error}
        leftIcon={KeyRound}
        autoComplete={autoComplete}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] text-content-muted transition-colors hover:bg-surface-hover hover:text-content focus-visible:outline-2 focus-visible:outline-ring"
          >
            {visible ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
          </button>
        }
        {...props}
      />
      {showStrength && <PasswordStrength value={value} />}
    </div>
  );
}