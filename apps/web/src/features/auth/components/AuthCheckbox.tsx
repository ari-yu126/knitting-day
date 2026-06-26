import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type AuthCheckboxProps = {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
  align?: "center" | "start";
};

export function AuthCheckbox({
  id,
  checked,
  onChange,
  label,
  className,
  align = "center",
}: AuthCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "group text-gray flex cursor-pointer gap-2.5 text-sm select-none",
        align === "start" ? "items-start" : "items-center",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "border-beige flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] bg-white transition-colors",
          "group-hover:border-purple/40",
          "peer-focus-visible:ring-purple-light peer-focus-visible:ring-4",
          checked && "border-purple bg-purple",
          align === "start" && "mt-0.5",
        )}
      >
        <Check
          className={cn(
            "h-3 w-3 text-white transition-opacity",
            checked ? "opacity-100" : "opacity-0",
          )}
          strokeWidth={3}
          aria-hidden
        />
      </span>
      {label}
    </label>
  );
}
