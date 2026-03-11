import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIssueStore } from "../store/issueStore";
import { useAuthStore } from "../../auth/store/authStore";
import StatusBadge from "../components/StatusBadge";
import WorkflowActions from "../components/WorkflowActions";
import IssueForm from "../components/IssueForm";
import {
  formatDateTime,
  getPriorityColor,
  getTimeRemaining,
} from "../../../shared/lib/utils";
import { ArrowLeft, Sparkles, Loader2, Clock, Pencil } from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/api/axios";

export default function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedIssue, fetchIssueById, generateAISummary, loading } =
    useIssueStore();
  const { user } = useAuthStore();
  const [aiLoading, setAiLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    fetchIssueById(id);
    api
      .get(`/audit/${id}`)
      .then(({ data }) => setAuditLogs(data))
      .catch(() => {});
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

  if (loading || !selectedIssue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sla = getTimeRemaining(selectedIssue.dueDate);
  const latestSummary =
    selectedIssue.aiSummary?.[selectedIssue.aiSummary.length - 1];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/issues")}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Issues
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={selectedIssue.status} />
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium ${getPriorityColor(selectedIssue.priority)}`}
              >
                {selectedIssue.priority}
              </span>
              {sla && (
                <span
                  className={`flex items-center gap-1 text-xs ${sla.color}`}
                >
                  <Clock className="w-3 h-3" />
                  {sla.label}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              {selectedIssue.title}
            </h1>
            <p className="text-gray-400 text-sm">{selectedIssue.description}</p>
            <p className="text-gray-600 text-xs mt-3">
              Category: {selectedIssue.category} · Created:{" "}
              {formatDateTime(selectedIssue.createdAt)}
            </p>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
            Move to Next State
          </p>
          <WorkflowActions issue={selectedIssue} />
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> AI Root Cause
            Analysis
          </h2>
          <button
            onClick={handleAISummary}
            disabled={aiLoading}
            className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {aiLoading ? "Generating..." : "Generate Summary"}
          </button>
        </div>

        {latestSummary ? (
          <div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {latestSummary.text}
            </div>
            <p className="text-gray-600 text-xs mt-2">
              Version {latestSummary.version} ·{" "}
              {formatDateTime(latestSummary.generatedAt)}
            </p>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">
            No AI summary yet. Click "Generate Summary" to analyze this issue.
          </p>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Audit Trail</h2>
        <div className="space-y-3">
          {auditLogs.length === 0 ? (
            <p className="text-gray-600 text-sm">No audit logs yet.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log._id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-gray-300">
                    <span className="text-white font-medium">
                      {log.userId?.username || "System"}
                    </span>{" "}
                    {log.action}
                    {log.previousValue && (
                      <span className="text-gray-500">
                        {" "}
                        from{" "}
                        <span className="text-gray-300">
                          {String(log.previousValue)}
                        </span>
                      </span>
                    )}
                    {log.newValue && typeof log.newValue === "string" && (
                      <span className="text-gray-500">
                        {" "}
                        to <span className="text-gray-300">{log.newValue}</span>
                      </span>
                    )}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {formatDateTime(log.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showEdit && (
        <IssueForm
          editData={selectedIssue}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
