import { useState, useEffect } from "react";
import { 
  Zap, 
  Send, 
  Trash2, 
  Plus, 
  Clock, 
  FileJson, 
  FileCode, 
  Settings2, 
  History,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  MoreVertical,
  X
} from "lucide-react";
import api from "../../../shared/api/axios";
import { toast } from "sonner";
import { cn } from "../../../shared/lib/utils";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export default function ApiTesterPage() {
  // Request State
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState([{ key: "Content-Type", value: "application/json" }]);
  const [bodyType, setBodyType] = useState("json"); // json or formdata
  const [jsonBody, setJsonBody] = useState("{}");
  const [formData, setFormData] = useState([{ key: "", value: "", type: "text", file: null }]);
  
  // App State
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("headers");

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem("api_tester_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (req, res) => {
    const newItem = {
      id: Date.now(),
      url: req.url,
      method: req.method,
      status: res.status,
      time: res.time,
      timestamp: new Date().toISOString()
    };
    const updated = [newItem, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem("api_tester_history", JSON.stringify(updated));
  };

  const handleSend = async () => {
    if (!url) return toast.error("Please enter a URL");
    setLoading(true);
    setResponse(null);

    const headerObj = {};
    headers.forEach(h => { if (h.key && h.value) headerObj[h.key] = h.value; });

    try {
      const payload = {
        url,
        method,
        headers: headerObj,
      };

      let config = {
        headers: {
            'Content-Type': bodyType === 'json' ? 'application/json' : 'multipart/form-data'
        }
      };

      // Prepare request for proxy
      const proxyForm = new FormData();
      proxyForm.append('url', url);
      proxyForm.append('method', method);
      proxyForm.append('headers', JSON.stringify(headerObj));

      if (bodyType === "json") {
        try {
          const parsed = JSON.parse(jsonBody);
          proxyForm.append('jsonBody', JSON.stringify(parsed));
        } catch (e) {
          throw new Error("Invalid JSON body");
        }
      } else {
        const fields = {};
        formData.forEach((item, index) => {
          if (item.key) {
            if (item.type === "file" && item.file) {
              proxyForm.append(item.key, item.file);
            } else {
              fields[item.key] = item.value;
            }
          }
        });
        proxyForm.append('fields', JSON.stringify(fields));
      }

      const { data } = await api.post("/tester/proxy", proxyForm);
      setResponse(data);
      saveToHistory({ url, method }, data);
      toast.success("Request completed");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Request failed");
      setResponse({
          status: error.response?.status || 500,
          data: error.response?.data || error.message,
          error: true
      });
    } finally {
      setLoading(false);
    }
  };

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const removeHeader = (i) => setHeaders(headers.filter((_, idx) => idx !== i));
  const updateHeader = (i, field, val) => {
    const next = [...headers];
    next[i][field] = val;
    setHeaders(next);
  };

  const addFormItem = () => setFormData([...formData, { key: "", value: "", type: "text", file: null }]);
  const removeFormItem = (i) => setFormData(formData.filter((_, idx) => idx !== i));
  const updateFormItem = (i, field, val) => {
    const next = [...formData];
    next[i][field] = val;
    setFormData(next);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <Zap className="w-8 h-8 text-cyan-400 fill-cyan-400/20" />
            API Lab
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">
            Professional Web Testing Environment
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Main Interface */}
        <div className="lg:col-span-8 space-y-6">
          {/* URL & Method Bar */}
          <div className="bg-gray-950 border border-gray-800 rounded-3xl p-2 flex items-center gap-2 shadow-2xl">
            <div className="relative group shrink-0">
               <select 
                 className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3 text-cyan-400 font-black text-xs appearance-none pr-10 focus:ring-2 focus:ring-cyan-500/50 outline-none transition cursor-pointer"
                 value={method}
                 onChange={(e) => setMethod(e.target.value)}
                >
                 {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none group-hover:text-cyan-400 transition" />
            </div>
            <input 
              type="text"
              placeholder="https://api.example.com/endpoint"
              className="flex-1 bg-transparent border-none text-white font-medium px-4 py-2 outline-none placeholder:text-gray-700"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              disabled={loading}
              onClick={handleSend}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-cyan-900/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </button>
          </div>

          {/* Request Configuration */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="flex border-b border-gray-800 bg-black/20">
              <button 
                onClick={() => setActiveTab("headers")}
                className={cn(
                  "px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 hover:text-white",
                  activeTab === "headers" ? "text-cyan-400 border-cyan-400" : "text-gray-600 border-transparent"
                )}
              >
                Headers ({headers.length})
              </button>
              <button 
                onClick={() => setActiveTab("body")}
                className={cn(
                  "px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 hover:text-white",
                  activeTab === "body" ? "text-cyan-400 border-cyan-400" : "text-gray-600 border-transparent"
                )}
              >
                Body
              </button>
            </div>

            <div className="p-6">
              {activeTab === "headers" && (
                <div className="space-y-3">
                  {headers.map((h, i) => (
                    <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                      <input 
                        type="text" 
                        placeholder="Key"
                        className="flex-1 bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white placeholder:text-gray-700 focus:border-cyan-500/50 outline-none transition"
                        value={h.key}
                        onChange={(e) => updateHeader(i, "key", e.target.value)}
                      />
                      <input 
                        type="text" 
                        placeholder="Value"
                        className="flex-1 bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white placeholder:text-gray-700 focus:border-cyan-500/50 outline-none transition"
                        value={h.value}
                        onChange={(e) => updateHeader(i, "value", e.target.value)}
                      />
                      <button 
                        onClick={() => removeHeader(i)}
                        className="p-2.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={addHeader}
                    className="flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition mt-4"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Header
                  </button>
                </div>
              )}

              {activeTab === "body" && (
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setBodyType("json")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition",
                        bodyType === "json" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-gray-600 hover:text-gray-400"
                      )}
                    >
                      <FileJson className="w-4 h-4" />
                      JSON Body
                    </button>
                    <button 
                      onClick={() => setBodyType("formdata")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition",
                        bodyType === "formdata" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-gray-600 hover:text-gray-400"
                      )}
                    >
                      <FileCode className="w-4 h-4" />
                      Multipart Form
                    </button>
                  </div>

                  {bodyType === "json" ? (
                    <textarea 
                      className="w-full h-48 bg-black/40 border border-gray-800 rounded-2xl p-4 font-mono text-xs text-blue-300 outline-none focus:border-cyan-500/50 transition"
                      placeholder='{ "key": "value" }'
                      value={jsonBody}
                      onChange={(e) => setJsonBody(e.target.value)}
                    />
                  ) : (
                    <div className="space-y-3">
                      {formData.map((row, i) => (
                        <div key={i} className="flex gap-2 items-center animate-in fade-in slide-in-from-left-2 duration-300">
                          <input 
                            type="text" 
                            placeholder="Key"
                            className="w-40 bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white placeholder:text-gray-700 outline-none transition"
                            value={row.key}
                            onChange={(e) => updateFormItem(i, "key", e.target.value)}
                          />
                          <select 
                             className="bg-black/40 border border-gray-800 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-500 outline-none"
                             value={row.type}
                             onChange={(e) => updateFormItem(i, "type", e.target.value)}
                           >
                            <option value="text">Text</option>
                            <option value="file">File</option>
                          </select>
                          {row.type === "text" ? (
                            <input 
                              type="text" 
                              placeholder="Value"
                              className="flex-1 bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white placeholder:text-gray-700 outline-none transition"
                              value={row.value}
                              onChange={(e) => updateFormItem(i, "value", e.target.value)}
                            />
                          ) : (
                            <input 
                              type="file" 
                              className="flex-1 text-xs text-gray-500 file:bg-gray-800 file:border-none file:text-cyan-400 file:rounded-lg file:px-3 file:py-1.5 file:mr-4 file:cursor-pointer"
                              onChange={(e) => updateFormItem(i, "file", e.target.files[0])}
                            />
                          )}
                          <button 
                            onClick={() => removeFormItem(i)}
                            className="p-2.5 text-gray-600 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={addFormItem}
                        className="flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition mt-4"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Parameter
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Response Section */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-black/40">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Response</h3>
              {response && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-gray-600 uppercase">Status:</span>
                    <span className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-lg border",
                      response.status < 300 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    )}>
                      {response.status} {response.statusText}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 border-l border-gray-800 pl-4 ml-4">
                    <span className="text-[9px] font-bold text-gray-600 uppercase">Time:</span>
                    <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                      {response.time}ms
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              {!response ? (
                <div className="py-20 text-center text-gray-600 italic text-sm">
                   Send a request to see the response...
                </div>
              ) : (
                <pre className="w-full max-h-96 overflow-auto custom-scrollbar font-mono text-[11px] text-gray-300 leading-relaxed bg-black/60 p-6 rounded-2xl border border-gray-800">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / History */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6 shadow-xl">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                 <History className="w-4 h-4 text-cyan-400" />
                 Recent History
               </h3>
               <button 
                 onClick={() => { setHistory([]); localStorage.removeItem("api_tester_history"); }}
                 className="text-[9px] font-black text-gray-600 hover:text-red-400 uppercase tracking-widest transition"
               >
                 Clear All
               </button>
             </div>

             <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
               {history.length === 0 ? (
                 <div className="text-center py-10">
                   <p className="text-gray-700 text-xs italic font-medium">No history yet</p>
                 </div>
               ) : (
                 history.map((item) => (
                   <div 
                     key={item.id}
                     onClick={() => { setUrl(item.url); setMethod(item.method); }}
                     className="group p-4 bg-gray-900/60 border border-gray-800/50 rounded-2xl hover:bg-gray-800/40 hover:border-cyan-500/30 transition-all cursor-pointer relative overflow-hidden"
                   >
                     <div className="flex items-start justify-between gap-3 relative z-10">
                       <span className={cn(
                         "text-[8px] font-black px-1.5 py-0.5 rounded border tracking-tighter shrink-0",
                         item.method === "GET" ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" :
                         item.method === "POST" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                         "text-violet-400 bg-violet-500/10 border-violet-500/20"
                       )}>
                         {item.method}
                       </span>
                       <p className="text-[10px] text-gray-400 font-bold truncate flex-1">{item.url}</p>
                     </div>
                     <div className="flex items-center justify-between mt-3 text-[9px] font-bold relative z-10">
                        <span className={item.status < 300 ? "text-emerald-500/70" : "text-amber-500/70"}>
                          {item.status}
                        </span>
                        <span className="text-gray-700 group-hover:text-gray-500 transition-colors uppercase tracking-widest">
                          {item.time}ms
                        </span>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>

          <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-3xl p-6">
             <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5" />
                Developer Tips
             </h4>
             <ul className="space-y-2">
               <li className="text-[10px] text-gray-500 font-medium list-disc ml-4 leading-relaxed">
                 Use the proxy for external APIs to bypass CORS.
               </li>
               <li className="text-[10px] text-gray-500 font-medium list-disc ml-4 leading-relaxed">
                 Multipart form data is perfect for testing file uploads.
               </li>
               <li className="text-[10px] text-gray-500 font-medium list-disc ml-4 leading-relaxed">
                 Requests are secured by your Novintix session.
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
