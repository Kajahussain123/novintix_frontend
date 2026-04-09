import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTaskStore } from "../store/taskStore";
import { useAuthStore } from "../../auth/store/authStore";
import { useSocket } from "../../../shared/hooks/useSocket";
import StatusBadge from "../components/StatusBadge";
import TaskForm from "../components/TaskForm";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import { projectApi } from "../../projects/api/projectApi";
import {
  formatDate,
  getPriorityColor,
  getTimeRemaining,
} from "../../../shared/lib/utils";
import { Plus, Search, RefreshCw, Trash2, ExternalLink, Filter } from "lucide-react";
import { toast } from "sonner";

export default function TasksPage() {
  const { tasks, loading, fetchTasks, deleteTask, applySocketUpdate } = useTaskStore();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [projects, setProjects] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useSocket(user?.tenantId, (data) => {
    if (data.taskId) {
      applySocketUpdate(data);
      toast.info(`Task status updated to "${data.status}"`);
    }
  });

  useEffect(() => {
    fetchTasks();
    const loadProjects = async () => {
      const data = await projectApi.getProjects();
      setProjects(data);
    };
    loadProjects();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTask(deleteTarget._id);
      toast.success(`Task deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchProject = !projectFilter || t.projectId?._id === projectFilter || t.projectId === projectFilter;
    return matchSearch && matchStatus && matchProject;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-gray-400 mt-1 text-sm">{tasks.length} total tasks assigned to your team.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchTasks(); toast.info("Refreshed"); }}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl border border-gray-800 transition shadow-sm"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          {["ADMIN", "MANAGER"].includes(user?.role) && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/10 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              New Task
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-cyan-500/50 outline-none transition placeholder:text-gray-600"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-800 text-gray-300 rounded-xl pl-9 pr-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition appearance-none cursor-pointer"
            >
              <option value="">All Projects</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900/50 border border-gray-800 text-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition cursor-pointer"
          >
            <option value="">All Statuses</option>
            {["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-sm font-medium uppercase tracking-wider">
              <th className="px-6 py-4">Task Name</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Priority</th>
              <th className="px-4 py-4 hidden md:table-cell">Project</th>
              <th className="px-4 py-4 hidden md:table-cell">Assignee</th>
              <th className="px-4 py-4 hidden lg:table-cell text-right">Due Date</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="px-6 py-8">
                    <div className="h-4 bg-gray-800 rounded w-1/3" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-24">
                  <div className="mb-4 text-gray-700 flex justify-center">
                    <Search className="w-12 h-12" />
                  </div>
                  <h3 className="text-gray-400 font-medium">No tasks found</h3>
                  <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filters.</p>
                </td>
              </tr>
            ) : (
              filtered.map((task) => (
                <tr key={task._id} className="hover:bg-gray-800/30 transition-all group">
                  <td className="px-6 py-5">
                    <Link to={`/tasks/${task._id}`} className="text-white font-medium hover:text-cyan-400 block transition">
                      {task.title}
                    </Link>
                    <span className="text-xs text-gray-500 md:hidden mt-1 block">
                      {task.projectId?.name || "No Project"}
                    </span>
                  </td>
                  <td className="px-4 py-5 font-semibold">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-gray-400 text-sm hidden md:table-cell">
                    {task.projectId?.name || "General"}
                  </td>
                  <td className="px-4 py-5 text-gray-400 text-sm hidden md:table-cell">
                    <div className="flex items-center gap-2">
                       <span className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-[10px] border border-gray-700">
                         {task.assignedTo?.username?.[0] || "?"}
                       </span>
                       <span>{task.assignedTo?.username || "Unassigned"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-gray-400 text-sm hidden lg:table-cell text-right font-mono">
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/tasks/${task._id}`} className="p-1.5 text-gray-500 hover:text-cyan-400 transition" title="View details">
                        <ExternalLink className="w-4.5 h-4.5" />
                      </Link>
                      {["ADMIN", "MANAGER"].includes(user?.role) && (
                        <button onClick={() => setDeleteTarget(task)} className="p-1.5 text-gray-500 hover:text-red-400 transition" title="Delete task">
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Task"
        message={`Confirm deletion of "${deleteTarget?.title}". This action is permanent.`}
        confirmLabel="Delete Task"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
