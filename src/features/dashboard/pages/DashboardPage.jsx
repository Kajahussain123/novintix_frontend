import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAuthStore } from "../../auth/store/authStore";
import { taskApi } from "../../tasks/api/taskApi";
import {
  AlertCircle,
  Clock,
  TrendingDown,
  Activity,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { projectApi } from "../../projects/api/projectApi";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
  TODO: "#64748b",
  IN_PROGRESS: "#3b82f6",
  REVIEW: "#f59e0b",
  COMPLETED: "#10b981",
};

function StatCard({ icon: Icon, label, value, sub, color = "text-cyan-400" }) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            {label}
          </p>
          <p className={`text-4xl font-bold mt-2 ${color} tracking-tight`}>{value}</p>
          {sub && <p className="text-gray-600 text-[10px] font-medium uppercase mt-2 tracking-wider">{sub}</p>}
        </div>
        <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      taskApi.getDashboard(),
      projectApi.getProjects()
    ]).then(([{ data: statsData }, projectsData]) => {
      setStats(statsData);
      setProjects(projectsData.slice(0, 3)); // Show top 3 active projects
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pieData =
    stats?.tasksByStatus?.map((s) => ({ name: s._id, value: s.count })) || [];
  const barData =
    stats?.tasksByPriority?.map((s) => ({
      name: s._id || "Unknown",
      value: s.count,
    })) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Welcome back, <span className="text-cyan-400 font-semibold">{user?.username}</span>. Here's a summary of your workspace.
          </p>
        </div>
        <div className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">{user?.role} Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Activity}
          label="Total Tasks"
          value={stats?.totalTasks || 0}
        />
        <StatCard
          icon={AlertCircle}
          label="SLA Breaches"
          value={stats?.overdueTasks || 0}
          sub="Requires Attention"
          color="text-red-400"
        />
        <StatCard
          icon={TrendingDown}
          label="Breach Rate"
          value={`${stats?.breachPercentage || 0}%`}
          sub="Efficiency Index"
          color="text-amber-400"
        />
        <StatCard
          icon={Clock}
          label="Avg Resolution"
          value={`${stats?.avgResolutionHours || 0}h`}
          sub="Turnaround Time"
          color="text-emerald-400"
        />
      </div>

      {/* Active Projects Quick List */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" /> Active Projects
          </h2>
          <Link to="/projects" className="text-cyan-400 text-xs font-bold uppercase tracking-widest hover:text-cyan-300 transition flex items-center gap-1">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        {projects.length === 0 ? (
          <p className="text-gray-600 text-sm italic py-2">No projects assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map(project => (
              <Link 
                key={project._id} 
                to="/projects"
                className="group p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800 transition hover:border-cyan-500/30"
              >
                <p className="text-white font-semibold text-sm group-hover:text-cyan-400 transition truncate">{project.name}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                    {project.members?.length || 0} Members
                  </span>
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {project.members?.slice(0, 3).map((m, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border border-gray-900 bg-gray-700 flex items-center justify-center text-[8px] text-white">
                        {m.userId?.username?.[0] || "?"}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Pie Chart */}
        <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
          <h2 className="text-white font-bold text-xl mb-8 tracking-tight">Tasks by Status</h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-gray-700 font-medium italic">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] || "#374151"}
                      stroke="rgba(0,0,0,0)"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#030712",
                    border: "1px solid #1f2937",
                    borderRadius: 12,
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(v) => (
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider ml-1">{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-3 bg-gray-900/40 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
          <h2 className="text-white font-bold text-xl mb-8 tracking-tight">Tasks by Priority</h2>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-gray-700 font-medium italic">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    background: "#030712",
                    border: "1px solid #1f2937",
                    borderRadius: 12,
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#06b6d4" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {parseFloat(stats?.breachPercentage) > 20 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl px-6 py-5 flex items-start gap-4 animate-pulse">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          </div>
          <div>
            <p className="text-red-400 font-bold text-sm tracking-tight">
              High SLA Breach Rate Warning
            </p>
            <p className="text-red-500/60 text-xs mt-1 leading-relaxed font-medium">
              CRITICAL: {stats?.breachPercentage}% of active tasks have exceeded their due dates. 
              Immediate intervention recommended for operational stability.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
