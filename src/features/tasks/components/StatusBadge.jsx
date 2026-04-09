import { cn } from "../../../shared/lib/utils";

const statusConfig = {
  TODO: "bg-gray-800 text-gray-400 border-gray-700",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  REVIEW: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-semibold border",
        statusConfig[status] || "bg-gray-800 text-gray-400 border-gray-700",
        className,
      )}
    >
      {status}
    </span>
  );
}
