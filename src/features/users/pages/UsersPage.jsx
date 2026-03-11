import { useEffect, useState } from "react";
import { userApi } from "../api/userApi";
import { getRoleColor, formatDate } from "../../../shared/lib/utils";
import { Users, UserPlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

const ROLES = ["Admin", "Manager", "Reviewer", "User"];

function InviteModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "User",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.invite(form);
      toast.success(`${form.username} invited as ${form.role}`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to invite user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">Invite Team Member</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            {
              name: "username",
              label: "Name",
              placeholder: "Jane Doe",
              type: "text",
            },
            {
              name: "email",
              label: "Email",
              placeholder: "jane@company.com",
              type: "email",
            },
            {
              name: "password",
              label: "Temp Password",
              placeholder: "••••••••",
              type: "password",
            },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm text-gray-400 mb-1.5">
                {f.label}
              </label>
              <input
                type={f.type}
                name={f.name}
                value={form[f.name]}
                required
                placeholder={f.placeholder}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-semibold rounded-lg px-4 py-2.5 text-sm flex items-center justify-center gap-2 transition"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Invite User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    userApi
      .getAll()
      .then(({ data }) => setUsers(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, role, username) => {
    try {
      await userApi.updateRole(id, role);
      setUsers((us) => us.map((u) => (u._id === id ? { ...u, role } : u)));
      toast.success(`${username}'s role updated to ${role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" /> Team Members
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {users.length} members in your organization
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold px-4 py-2 rounded-lg text-sm transition"
        >
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left px-6 py-3 font-medium">Member</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  Change Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-800/40 transition">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{u.username}</p>
                    <p className="text-gray-500 text-xs">{u.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium ${getRoleColor(u.role)}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-400 hidden md:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleRoleChange(u._id, e.target.value, u.username)
                      }
                      className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
                    >
                      {ROLES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
