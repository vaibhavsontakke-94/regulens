import { cx } from "@/lib/utils";

export default function Container({ className, children, ...props }) {
  return (
    <div className={cx("u-container", className)} {...props}>
      {children}
    </div>
  );
}