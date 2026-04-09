import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status) {
  const map = {
    TODO: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    IN_PROGRESS: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    REVIEW: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    COMPLETED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  };
  return map[status] || "bg-slate-500/20 text-slate-300";
}

export function getPriorityColor(priority) {
  const map = {
    LOW: "bg-green-500/20 text-green-300",
    MEDIUM: "bg-yellow-500/20 text-yellow-300",
    HIGH: "bg-orange-500/20 text-orange-300",
  };
  return map[priority] || "bg-slate-500/20 text-slate-300";
}

export function getRoleColor(role) {
  const map = {
    ADMIN: "bg-violet-500/20 text-violet-300",
    MANAGER: "bg-blue-500/20 text-blue-300",
    DEVELOPER: "bg-slate-500/20 text-slate-300",
    DESIGNER: "bg-pink-500/20 text-pink-300",
    TESTER: "bg-orange-500/20 text-orange-300",
  };
  return map[role] || "bg-slate-500/20 text-slate-300";
}

export function getRoleLabel(role) {
  const map = {
    ADMIN: "Administrator",
    MANAGER: "Project Manager",
    DEVELOPER: "Developer",
    DESIGNER: "UI/UX Designer",
    TESTER: "QA Tester",
  };
  return map[role] || role;
}

export function getTimeRemaining(dueDate) {
  if (!dueDate) return null;
  const diff = new Date(dueDate) - new Date();
  if (diff < 0) return { label: "Overdue", color: "text-red-400" };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 1)
    return { label: `${days}d remaining`, color: "text-emerald-400" };
  if (hours > 0)
    return { label: `${hours}h remaining`, color: "text-amber-400" };
  return { label: "Due soon", color: "text-orange-400" };
}
