import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Shield, UserPlus, Loader2, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../shared/lib/utils";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    organizationName: "",
  });
  const [step, setStep] = useState(0); // 0: Details, 1: OTP
  const [otp, setOtp] = useState("");
  const { register, sendOtp, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await sendOtp(form.email);
      toast.success("Verification code sent to your email!");
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Please enter a 6-digit code");
    
    try {
      await register({ ...form, otp });
      toast.success("Organization created! Welcome aboard 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
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
          {step === 0 ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">
                Create your organization
              </h2>
              <p className="text-gray-400 text-sm mb-6">You'll be added as Admin</p>

              <form onSubmit={handleSendOtp} className="space-y-4">
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
                  className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-semibold rounded-lg px-4 py-2.5 text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-cyan-500/10"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  {loading ? "Sending OTP..." : "Continue to Verification"}
                </button>
              </form>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <button 
                onClick={() => setStep(0)}
                className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 transition group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Change Email
              </button>
              
              <h2 className="text-xl font-bold text-white mb-2">
                Verify your email
              </h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                We've sent a 6-digit code to <span className="text-cyan-400 font-bold">{form.email}</span>. Please enter it below to continue.
              </p>

              <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-gray-900 border-2 border-gray-800 text-white rounded-2xl px-6 py-4 text-3xl font-black text-center tracking-[0.5em] focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none placeholder:text-gray-800"
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-black rounded-2xl px-4 py-4 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-cyan-500/20 active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    {loading ? "Verifying..." : "Verify & Create Organization"}
                  </button>
                  
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSendOtp}
                    className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest py-2 transition"
                  >
                    <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                    Resend Code
                  </button>
                </div>
              </form>
            </div>
          )}

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
