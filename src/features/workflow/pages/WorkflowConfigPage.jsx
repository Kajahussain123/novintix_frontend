import { useEffect, useState } from "react";
import { workflowApi } from "../api/workflowApi";
import { GitBranch, ArrowRight, RefreshCw } from "lucide-react";
import { getStatusColor } from "../../../shared/lib/utils";

export default function WorkflowConfigPage() {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkflow = () => {
    setLoading(true);
    workflowApi
      .get()
      .then(({ data }) => setWorkflow(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkflow();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-cyan-400" /> Workflow
            Configuration
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{workflow?.name}</p>
        </div>
        <button
          onClick={fetchWorkflow}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">States</h2>
        <div className="flex flex-wrap gap-3">
          {workflow?.states?.map((s) => (
            <div
              key={s._id}
              className={`px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(s.name)}`}
            >
              {s.name}
              {s.isInitial && (
                <span className="ml-1.5 text-xs opacity-60">(initial)</span>
              )}
              {s.isFinal && (
                <span className="ml-1.5 text-xs opacity-60">(final)</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Transitions</h2>
        <div className="space-y-3">
          {workflow?.transitions?.map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-gray-800/50 rounded-lg px-4 py-3"
            >
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(t.from)}`}
              >
                {t.from}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-600" />
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(t.to)}`}
              >
                {t.to}
              </span>
              <div className="ml-auto flex flex-wrap gap-1">
                {t.requiredRole?.map((r) => (
                  <span
                    key={r}
                    className="px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded text-xs"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
