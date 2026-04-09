import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";
import { useUiStore } from "../../store/uiStore";
import {
  LayoutDashboard,
  CheckSquare,
  Briefcase,
  GitBranch,
  Users,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: Briefcase, label: "Projects", roles: ["ADMIN", "MANAGER", "DEVELOPER", "DESIGNER", "TESTER"] },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
  {
    to: "/workflow",
    icon: GitBranch,
    label: "Workflow",
    roles: ["ADMIN", "MANAGER"],
  },
  { to: "/users", icon: Users, label: "Users", roles: ["ADMIN", "MANAGER"] },
  { to: "/api-lab", icon: Zap, label: "API Lab", roles: ["ADMIN", "MANAGER", "DEVELOPER"] },
];

import NotificationCenter from "../notifications/NotificationCenter";

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role),
  );

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen z-40 flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300",
        sidebarOpen ? "w-60" : "w-16",
      )}
    >
      {/* Logo Area */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 shrink-0">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-none">
                Novintix
              </p>
              <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-widest">{user?.role}</p>
            </div>
          )}
        </div>
        
        {/* Notification Bell */}
        <NotificationCenter />
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 bg-gray-800 border border-gray-700 rounded-full p-1 text-gray-400 hover:text-white hover:bg-gray-700 transition z-10"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              title={!sidebarOpen ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-4 border-t border-gray-800">
        {sidebarOpen && (
          <div className="px-3 py-2 mb-2">
            <p className="text-white text-sm font-medium truncate">
              {user?.username}
            </p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={!sidebarOpen ? "Log out" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {sidebarOpen && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
