import { useState, useEffect } from "react";
import { taskApi } from "../api/taskApi";
import { useTaskStore } from "../store/taskStore";
import { useAuthStore } from "../../auth/store/authStore";
import { toast } from "sonner";
import api from "../../../shared/api/axios";

export default function WorkflowActions({ task }) {
  const { transitionStatus } = useTaskStore();
  const { user } = useAuthStore();
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const { data } = await api.get("/workflows");
        const possible = data.transitions.filter((t) => t.from === task.status);
        setTransitions(possible);
      } catch (err) {
        console.error("Failed to fetch workflow transitions", err);
      }
    };
    fetchWorkflow();
  }, [task.status]);

  const handleTransition = async (newStatus) => {
    setLoading(true);
    try {
      await transitionStatus(task._id, newStatus);
      toast.success(`Task moved to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Transition failed");
    } finally {
      setLoading(false);
    }
  };

  if (transitions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {transitions.map((t) => {
        const hasRole = !t.requiredRole || t.requiredRole.includes(user.role);
        return (
          <button
            key={t.to}
            disabled={loading || !hasRole}
            onClick={() => handleTransition(t.to)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 text-white rounded-lg text-sm font-medium transition active:scale-95"
          >
            Move to {t.to}
          </button>
        );
      })}
    </div>
  );
}
