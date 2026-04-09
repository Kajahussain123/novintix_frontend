import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuthStore } from "../../auth/store/authStore";
import { Briefcase, Plus, Search, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { projectApi } from "../api/projectApi";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectApi.getProjects();
      setProjects(data);
    } catch (error) {
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await projectApi.createProject(newProject);
      toast.success("Project created successfully");
      setShowCreateModal(false);
      setNewProject({ name: "", description: "" });
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await projectApi.deleteProject(deleteTarget._id);
      toast.success("Project deleted");
      setDeleteTarget(null);
      fetchProjects();
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage your team's workspace and objectives.</p>
        </div>
        
        {["ADMIN", "MANAGER"].includes(user?.role) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/20 active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search projects..."
          className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 bg-gray-900/50 rounded-2xl animate-pulse border border-gray-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="group bg-gray-900/40 border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-all hover:shadow-2xl hover:shadow-cyan-500/5 relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {["ADMIN", "MANAGER"].includes(user?.role) && (
                  <button 
                    onClick={() => setDeleteTarget(project)}
                    className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl border border-cyan-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-cyan-400" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {project.name}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">
                {project.description || "No description provided."}
              </p>

              <div className="flex items-center justify-between pt-5 border-t border-gray-800/50">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{project.members?.length || 0} members</span>
                </div>
                <Link 
                  to={`/projects/${project._id}`}
                  className="text-cyan-400 text-sm font-semibold hover:underline"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
              <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-600">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-gray-400 text-lg font-medium">No projects found</h3>
              <p className="text-gray-600">Try adjusting your search or create a new project.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All associated tasks will be orphaned.`}
        confirmLabel="Delete Project"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
