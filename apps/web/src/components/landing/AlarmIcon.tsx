import { Bell, BellRing } from "lucide-react";

export function Alarm() {
  return (
    <button type="button" aria-label="알림 이동" className="group flex gap-2">
      <Bell className="text-gray h-5 w-5 group-hover:hidden" />
      <BellRing className="text-gray hidden h-5 w-5 group-hover:block" />
      <span className="text-sm font-medium md:hidden">알림</span>
    </button>
  );
}
