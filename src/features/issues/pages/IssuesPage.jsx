import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useIssueStore } from "../store/issueStore";
import { useAuthStore } from "../../auth/store/authStore";
import { useSocket } from "../../../shared/hooks/useSocket";
import StatusBadge from "../components/StatusBadge";
import IssueForm from "../components/IssueForm";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import {
  formatDate,
  getPriorityColor,
  getTimeRemaining,
} from "../../../shared/lib/utils";
import { Plus, Search, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function IssuesPage() {
  const { issues, loading, fetchIssues, deleteIssue, applySocketUpdate } =
    useIssueStore();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null); // { _id, title }
  const [deleteLoading, setDeleteLoading] = useState(false);

  useSocket(user?.tenantId, (data) => {
    applySocketUpdate(data);
    toast.info(`Issue status updated to "${data.status}" by another user`);
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteIssue(deleteTarget._id);
      toast.success(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete issue");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = issues.filter((i) => {
    const matchSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Issues</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {issues.length} total issues
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchIssues();
              toast.info("Issues refreshed");
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold px-4 py-2 rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Issue
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues..."
            className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 text-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
        >
          <option value="">All Statuses</option>
          {[
            "Draft",
            "Submitted",
            "Under Review",
            "Approved",
            "Rejected",
            "Closed",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left px-6 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Priority</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                  Due Date
                </th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                  SLA
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-12">
                    No issues found
                  </td>
                </tr>
              ) : (
                filtered.map((issue) => {
                  const sla = getTimeRemaining(issue.dueDate);
                  return (
                    <tr
                      key={issue._id}
                      className="hover:bg-gray-800/50 transition group"
                    >
                      <td className="px-6 py-4">
                        <Link
                          to={`/issues/${issue._id}`}
                          className="text-white hover:text-cyan-400 font-medium transition"
                        >
                          {issue.title}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={issue.status} />
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-medium ${getPriorityColor(issue.priority)}`}
                        >
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-400 hidden md:table-cell">
                        {issue.category}
                      </td>
                      <td className="px-4 py-4 text-gray-400 hidden lg:table-cell">
                        {formatDate(issue.dueDate)}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        {sla && (
                          <span className={`text-xs font-medium ${sla.color}`}>
                            {sla.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                          <Link
                            to={`/issues/${issue._id}`}
                            className="p-1 text-gray-400 hover:text-cyan-400 transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          {["Admin", "Manager"].includes(user?.role) && (
                            <button
                              onClick={() => setDeleteTarget(issue)}
                              className="p-1 text-gray-400 hover:text-red-400 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <IssueForm onClose={() => setShowForm(false)} />}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Issue"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone and will remove all associated audit logs.`}
        confirmLabel="Delete Issue"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleteLoading && setDeleteTarget(null)}
      />
    </div>
  );
}
