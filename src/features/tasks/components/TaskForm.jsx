import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import { projectApi } from "../../projects/api/projectApi";
import { toast } from "sonner";

export default function TaskForm({ onClose, initialData = null }) {
  const { createTask, updateTask } = useTaskStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    projectId: "",
    assignedTo: null,
    ...initialData,
  });

  const selectedProject = projects.find(p => p._id === formData.projectId);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectApi.getProjects();
        setProjects(data);
        if (!formData.projectId && data.length > 0) {
          setFormData(prev => ({ ...prev, projectId: data[0]._id }));
        }
      } catch (error) {
        toast.error("Failed to load projects");
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      assignedTo: formData.assignedTo || null, // Ensure empty string becomes null
    };

    try {
      if (initialData?._id) {
        await updateTask(initialData._id, payload);
        toast.success("Task updated");
      } else {
        await createTask(payload);
        toast.success("Task created");
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">
            {initialData ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Title</label>
            <input
              required
              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Project</label>
              <select
                required
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value, assignedTo: null })}
                disabled={projectsLoading}
              >
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Assigned To</label>
              <select
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                value={formData.assignedTo || ""}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <option value="">Unassigned</option>
                {selectedProject?.members?.map(m => (
                  <option key={m.userId._id} value={m.userId._id}>
                    {m.userId.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Priority</label>
              <select
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Due Date</label>
              <input
                required
                type="date"
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ""}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Description</label>
            <textarea
              required
              rows={4}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            disabled={loading || projectsLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 text-white font-bold py-3 mt-4 rounded-xl shadow-lg shadow-cyan-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialData ? "Save Changes" : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
}
