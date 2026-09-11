import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils";

export default function CodeInput({
  length = 6,
  value,
  onChange,
  error,
  disabled = false,
}) {
  const refs = useRef([]);
  const [digits, setDigits] = useState(() =>
    Array.from({ length }, (_, i) => (value ? String(value)[i] || "" : ""))
  );

  useEffect(() => {
    if (value !== undefined && value !== digits.join("")) {
      setDigits(Array.from({ length }, (_, i) => String(value || "")[i] || ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function focusBox(index) {
    const el = refs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }

  function handleChange(index, event) {
    const chars = event.target.value.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[index] = chars;
    setDigits(next);
    onChange?.(next.join(""));
    if (chars && index < length - 1) focusBox(index + 1);
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusBox(index - 1);
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      focusBox(index + 1);
    }
  }

  function handlePaste(event) {
    event.preventDefault();
    const text = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    const next = [];
    for (let i = 0; i < length; i += 1) next.push(text[i] || "");
    setDigits(next);
    onChange?.(next.join(""));
    focusBox(Math.min(text.length, length - 1));
  }

  return (
    <div
      role="group"
      aria-label="Verification code"
      className={cx("flex items-center gap-2 sm:gap-2.5", error && "border-danger")}
      onPaste={handlePaste}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          autoFocus={index === 0}
          aria-invalid={error ? true : undefined}
          className={cx(
            "h-12 w-10 rounded-[10px] border bg-surface text-center text-lg font-semibold text-content select-none sm:w-11",
            "focus:outline-none focus:ring-2 focus:ring-primary/25",
            error
              ? "border-danger focus:border-danger"
              : "border-line focus:border-primary"
          )}
        />
      ))}
    </div>
  );
}