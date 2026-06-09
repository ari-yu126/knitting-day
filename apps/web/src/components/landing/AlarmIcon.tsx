import { Bell, BellRing } from "lucide-react";

export function Alarm() {
  return (
    <button
      type="button"
      aria-label="알림 이동"
      className="group"
    >
      <Bell className="w-5 h-5 text-gray group-hover:hidden" />
      <BellRing className="w-5 h-5 text-gray hidden group-hover:block" />
    </button>
  );
}