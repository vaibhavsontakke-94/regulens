import { cx } from "@/lib/utils";

export default function Card({ className, interactive = false, children, ...props }) {
  return (
    <div
      className={cx(
        "rounded-card border border-line bg-surface shadow-card",
        interactive &&
          "transition-all duration-200 hover:-translate-y-1 hover:border-line-strong hover:shadow-card-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}