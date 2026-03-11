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
import { issueApi } from "../../issues/api/issueApi";
import {
  AlertCircle,
  Clock,
  TrendingDown,
  Activity,
} from "lucide-react";

const STATUS_COLORS = {
  Draft: "#64748b",
  Submitted: "#3b82f6",
  "Under Review": "#f59e0b",
  Approved: "#10b981",
  Rejected: "#ef4444",
  Closed: "#a855f7",
};

function StatCard({ icon: Icon, label, value, sub, color = "text-cyan-400" }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
            {label}
          </p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
        </div>
        <div className="p-2 bg-gray-800 rounded-lg">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issueApi
      .getDashboard()
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pieData =
    stats?.issuesByStatus?.map((s) => ({ name: s._id, value: s.count })) || [];
  const barData =
    stats?.issuesByCategory?.map((s) => ({
      name: s._id || "Unknown",
      value: s.count,
    })) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Welcome back, {user?.username} · {user?.role}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Total Issues"
          value={stats?.totalIssues || 0}
        />
        <StatCard
          icon={AlertCircle}
          label="Overdue Issues"
          value={stats?.overdueIssues || 0}
          sub="SLA breached"
          color="text-red-400"
        />
        <StatCard
          icon={TrendingDown}
          label="SLA Breach Rate"
          value={`${stats?.breachPercentage || 0}%`}
          sub="of all issues"
          color="text-amber-400"
        />
        <StatCard
          icon={Clock}
          label="Avg Resolution"
          value={`${stats?.avgResolutionHours || 0}h`}
          sub="for closed issues"
          color="text-emerald-400"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Issues by Status</h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-600">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] || "#6b7280"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => (
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Issues by Category</h2>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-600">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {parseFloat(stats?.breachPercentage) > 20 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium text-sm">
              High SLA Breach Rate Detected
            </p>
            <p className="text-red-400/70 text-xs mt-0.5">
              {stats?.breachPercentage}% of issues have breached their SLA.
              Review and prioritize overdue issues.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
