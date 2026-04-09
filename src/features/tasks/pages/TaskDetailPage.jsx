import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTaskStore } from "../store/taskStore";
import { useAuthStore } from "../../auth/store/authStore";
import StatusBadge from "../components/StatusBadge";
import WorkflowActions from "../components/WorkflowActions";
import TaskForm from "../components/TaskForm";
import {
  formatDateTime,
  getPriorityColor,
  getTimeRemaining,
} from "../../../shared/lib/utils";
import { ArrowLeft, Sparkles, Loader2, Clock, Pencil, Clipboard, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/api/axios";

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedTask, fetchTaskById, generateAISummary, loading } = useTaskStore();
  const { user } = useAuthStore();
  const [aiLoading, setAiLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    fetchTaskById(id);
    api.get(`/audit/${id}`).then(({ data }) => setAuditLogs(data)).catch(() => {});
  }, [id]);

  const handleAISummary = async () => {
    setAiLoading(true);
    try {
      await generateAISummary(id);
      toast.success("AI summary generated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "AI summary failed");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !selectedTask) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sla = getTimeRemaining(selectedTask.dueDate);
  const latestSummary = selectedTask.aiSummary?.[selectedTask.aiSummary.length - 1];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => navigate("/tasks")}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tasks
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
              {["ADMIN", "MANAGER"].includes(user?.role) && (
                <button
                  onClick={() => setShowEdit(true)}
                  className="p-2.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-xl transition shadow-xl"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <StatusBadge status={selectedTask.status} className="text-[10px] px-3 py-1" />
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getPriorityColor(selectedTask.priority)} border-current bg-transparent`}>
                {selectedTask.priority}
              </span>
              {sla && (
                <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${sla.color} bg-gray-800/50 px-3 py-1 rounded-full`}>
                  <Clock className="w-3 h-3" />
                  {sla.label}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-white mb-4 tracking-tight leading-tight">
              {selectedTask.title}
            </h1>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 text-lg leading-relaxed">
                {selectedTask.description}
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800/50 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Clipboard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Project</p>
                  <p className="text-white font-medium">{selectedTask.projectId?.name || "General"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Assigned To</p>
                  <p className="text-white font-medium">{selectedTask.assignedTo?.username || "Unassigned"}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800/50">
              <p className="text-[10px] text-gray-500 mb-4 font-bold uppercase tracking-widest">
                Update Status
              </p>
              <WorkflowActions task={selectedTask} />
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                AI Root Cause Analysis
              </h2>
              <button
                onClick={handleAISummary}
                disabled={aiLoading}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-lg shadow-cyan-500/10"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiLoading ? "Analyzing..." : "Regenerate"}
              </button>
            </div>

            {latestSummary ? (
              <div className="space-y-4">
                <div className="bg-gray-800/40 rounded-xl p-6 text-gray-300 leading-relaxed border border-gray-800/50 shadow-inner">
                  <div className="prose prose-invert prose-sm max-w-none">
                    {latestSummary.text}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest ml-1">
                  <span>Version {latestSummary.version}</span>
                  <span>•</span>
                  <span>{formatDateTime(latestSummary.generatedAt)}</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center bg-gray-800/20 rounded-2xl border border-dashed border-gray-800">
                <Sparkles className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">
                  No AI analysis triggered for this task.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Log */}
        <div className="space-y-6">
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm sticky top-8">
            <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Audit Trail
            </h2>
            <div className="space-y-6 relative ml-1">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-800" />
              {auditLogs.length === 0 ? (
                <p className="text-gray-600 text-sm">No activity recorded.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log._id} className="relative pl-6">
                    <div className="absolute left-[-2px] top-2 w-3 h-3 rounded-full bg-cyan-500 border-2 border-gray-900 z-10 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                    <p className="text-gray-300 text-sm leading-snug">
                      <span className="text-white font-semibold">
                        {log.userId?.username || "System"}
                      </span>{" "}
                      {log.action}
                    </p>
                    {log.newValue && typeof log.newValue === "string" && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        New status: <span className="text-cyan-400 font-medium">{log.newValue}</span>
                      </p>
                    )}
                    <p className="text-gray-600 text-[10px] mt-1.5 font-bold uppercase tracking-widest">
                      {formatDateTime(log.timestamp)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <TaskForm
          initialData={selectedTask}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
