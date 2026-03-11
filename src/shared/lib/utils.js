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
    Draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    Submitted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "Under Review": "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Rejected: "bg-red-500/20 text-red-300 border-red-500/30",
    Closed: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };
  return map[status] || "bg-slate-500/20 text-slate-300";
}

export function getPriorityColor(priority) {
  const map = {
    Low: "bg-green-500/20 text-green-300",
    Medium: "bg-yellow-500/20 text-yellow-300",
    High: "bg-orange-500/20 text-orange-300",
    Critical: "bg-red-500/20 text-red-300",
  };
  return map[priority] || "bg-slate-500/20 text-slate-300";
}

export function getRoleColor(role) {
  const map = {
    Admin: "bg-violet-500/20 text-violet-300",
    Manager: "bg-blue-500/20 text-blue-300",
    Reviewer: "bg-cyan-500/20 text-cyan-300",
    User: "bg-slate-500/20 text-slate-300",
  };
  return map[role] || "bg-slate-500/20 text-slate-300";
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
