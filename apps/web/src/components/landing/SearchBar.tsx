import { Search } from "lucide-react";

type SearchBarProps = {
  onClick: () => void;
};

export function SearchBar({ onClick }: SearchBarProps) {
  return (
    <button
      type="button"
      aria-label="검색"
      onClick={onClick}
      className="text-gray hover:text-purple transition-colors"
    >
      <Search className="size-5" />
    </button>
  );
}
