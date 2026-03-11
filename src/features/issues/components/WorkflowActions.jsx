import { useState } from "react";
import { useIssueStore } from "../store/issueStore";
import { useAuthStore } from "../../auth/store/authStore";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const TRANSITIONS = {
  Draft: [{ to: "Submitted", roles: ["Admin", "Manager", "User"] }],
  Submitted: [{ to: "Under Review", roles: ["Admin", "Manager", "Reviewer"] }],
  "Under Review": [
    { to: "Approved", roles: ["Admin", "Manager", "Reviewer"] },
    { to: "Rejected", roles: ["Admin", "Manager", "Reviewer"] },
  ],
  Approved: [{ to: "Closed", roles: ["Admin", "Manager"] }],
};

const TRANSITION_COLORS = {
  Submitted:
    "bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Under Review":
    "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30",
  Approved:
    "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Rejected: "bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30",
  Closed:
    "bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export default function WorkflowActions({ issue }) {
  const { transitionStatus } = useIssueStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(null);

  const transitions = TRANSITIONS[issue?.status] || [];
  const allowed = transitions.filter((t) => t.roles.includes(user?.role));

  if (!allowed.length) return null;

  const handleTransition = async (newStatus) => {
    setLoading(newStatus);
    try {
      await transitionStatus(issue._id, newStatus);
      toast.success(`Status moved to "${newStatus}"`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Transition failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {allowed.map((t) => (
        <button
          key={t.to}
          onClick={() => handleTransition(t.to)}
          disabled={!!loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${TRANSITION_COLORS[t.to]} disabled:opacity-50`}
        >
          {loading === t.to ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ArrowRight className="w-3 h-3" />
          )}
          Move to {t.to}
        </button>
      ))}
    </div>
  );
}
