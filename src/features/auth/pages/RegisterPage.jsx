import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Shield, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    organizationName: "",
  });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success("Organization created! Welcome aboard 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Novintix</h1>
            <p className="text-xs text-gray-500">Compliance Platform</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">
            Create your organization
          </h2>
          <p className="text-gray-400 text-sm mb-6">You'll be added as Admin</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              {
                name: "organizationName",
                label: "Organization Name",
                placeholder: "MedTech Inc.",
                type: "text",
              },
              {
                name: "username",
                label: "Your Name",
                placeholder: "John Doe",
                type: "text",
              },
              {
                name: "email",
                label: "Email",
                placeholder: "you@company.com",
                type: "email",
              },
              {
                name: "password",
                label: "Password",
                placeholder: "••••••••",
                type: "password",
              },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm text-gray-400 mb-1.5">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                  placeholder={field.placeholder}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition placeholder:text-gray-600"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-semibold rounded-lg px-4 py-2.5 text-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading ? "Creating..." : "Create Organization"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
