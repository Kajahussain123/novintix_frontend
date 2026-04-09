import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { 
  Users, 
  Trash2, 
  Plus, 
  Loader2, 
  Mail, 
  ShieldCheck, 
  Layout, 
  MessageSquare, 
  ChevronLeft,
  Briefcase
} from "lucide-react";
import { projectApi } from "../api/projectApi";
import { userApi } from "../../users/api/userApi";
import { toast } from "sonner";
import { useAuthStore } from "../../auth/store/authStore";
import ChatPanel from "../../../shared/components/ChatPanel";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [project, setProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const { user: currentUser } = useAuthStore();

  const isManager = ["ADMIN", "MANAGER"].includes(currentUser?.role);

  useEffect(() => {
    fetchProject();
    if (isManager) {
      userApi.getAll().then(({ data }) => setAllUsers(data)).catch(() => {});
    }
  }, [id, isManager]);

  const fetchProject = async () => {
    try {
      const data = await projectApi.getProjectById(id);
      setProject(data);
    } catch (error) {
      toast.error("Failed to fetch project details");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMember = async () => {
    if (!selectedUserId) return;
    setAssignLoading(true);
    try {
      const updatedMembers = [...(project.members || [])];
      if (updatedMembers.some(m => (m.userId?._id || m.userId) === selectedUserId)) {
        toast.error("User is already a member");
        return;
      }
      
      const newMember = { userId: selectedUserId, role: "DEVELOPER" };
      await projectApi.assignTeam(project._id, [...updatedMembers.map(m => ({
        userId: m.userId?._id || m.userId,
        role: m.role || "DEVELOPER"
      })), newMember]);
      
      toast.success("Member assigned successfully");
      setSelectedUserId("");
      fetchProject();
    } catch (error) {
      toast.error("Failed to assign member");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveMember = async (userIdToRemove) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    setAssignLoading(true);
    try {
      const updatedMembers = project.members
        .filter(m => (m.userId?._id || m.userId) !== userIdToRemove)
        .map(m => ({
          userId: m.userId?._id || m.userId,
          role: m.role || "DEVELOPER"
        }));

      await projectApi.assignTeam(project._id, updatedMembers);
      toast.success("Member removed");
      fetchProject();
    } catch (error) {
      toast.error("Failed to remove member");
    } finally {
      setAssignLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed max-w-2xl mx-auto mt-20">
        <Briefcase className="w-12 h-12 text-gray-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Project Not Found</h2>
        <p className="text-gray-500 mt-2">The project you're looking for doesn't exist or you don't have access.</p>
        <Link to="/projects" className="inline-block mt-6 text-cyan-400 hover:underline font-semibold">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumbs / Header */}
      <div className="flex flex-col gap-4">
        <Link to="/projects" className="flex items-center gap-2 text-gray-500 hover:text-white transition group w-fit">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold uppercase tracking-widest">Back to Projects</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">{project.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-gray-800 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-700">
                  ID: {project._id.slice(-6)}
                </span>
                <span className="text-gray-500 text-sm font-medium">•</span>
                <span className="text-gray-500 text-sm font-medium">Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar / Tabs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => switchTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                activeTab === "overview"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-900/10"
                  : "text-gray-500 hover:text-white hover:bg-gray-800 border border-transparent"
              }`}
            >
              <Layout className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => switchTab("chat")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all mt-1 ${
                activeTab === "chat"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-900/10"
                  : "text-gray-500 hover:text-white hover:bg-gray-800 border border-transparent"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Team Chat
            </button>
          </div>

          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-4">Quick Stats</h3>
            <div className="space-y-4">
               <div>
                  <p className="text-white font-black text-2xl tracking-tighter">{project.members?.length || 0}</p>
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Active Members</p>
               </div>
               <div className="w-full h-px bg-gray-800/50" />
               <div>
                  <p className="text-cyan-400 font-black text-2xl tracking-tighter">Active</p>
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Project Status</p>
               </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === "overview" ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.15em] mb-4">Description</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {project.description || "No description provided for this project."}
                </p>
              </div>

              <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.15em]">Team Members</h3>
                  <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20 tracking-widest uppercase">
                    {project.members?.length || 0} Members
                  </span>
                </div>

                {isManager && (
                  <div className="flex gap-2 mb-8 bg-black/20 p-2 rounded-2xl border border-gray-800">
                    <select
                      className="flex-1 bg-transparent border-none rounded-xl px-4 py-2.5 text-white text-sm focus:ring-0 outline-none transition cursor-pointer"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                      <option value="" className="bg-gray-950">Select a team member to add...</option>
                      {allUsers
                        .filter(u => !project.members?.some(m => (m.userId?._id || m.userId) === u._id))
                        .map(u => (
                          <option key={u._id} value={u._id} className="bg-gray-950">{u.username} ({u.email})</option>
                        ))
                      }
                    </select>
                    <button
                      disabled={!selectedUserId || assignLoading}
                      onClick={handleAssignMember}
                      className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl transition flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-cyan-900/20"
                    >
                      {assignLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Add Member
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.members?.map((member) => (
                    <div key={member.userId?._id || member.userId} className="group bg-gray-950/40 border border-gray-800/50 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-800/40 hover:border-cyan-500/30 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-800 group-hover:scale-110 transition-transform">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-white tracking-tight">{member.userId?.username || "Unknown User"}</p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <Mail className="w-3 h-3 text-cyan-400 opacity-50" />
                            <span>{member.userId?.email || "—"}</span>
                          </div>
                        </div>
                      </div>
                      {isManager && (
                        <button
                          disabled={assignLoading}
                          onClick={() => handleRemoveMember(member.userId?._id || member.userId)}
                          className="p-2.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Remove Member"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(!project.members || project.members.length === 0) && (
                    <div className="col-span-full py-12 text-center bg-gray-900/20 rounded-3xl border border-dashed border-gray-800 text-gray-600 font-medium italic">
                      No members assigned to this project yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full">
               <ChatPanel projectId={project._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
