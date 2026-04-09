import { useState, useEffect, useRef } from "react";
import { Send, User, Clock, Loader2 } from "lucide-react";
import { chatApi } from "../../features/projects/api/chatApi";
import { useSocket } from "../hooks/useSocket";
import { useAuthStore } from "../../features/auth/store/authStore";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function ChatPanel({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuthStore();
  const scrollRef = useRef(null);
  
  const socket = useSocket(user?.tenantId, (msg) => {
    if (msg.projectId === projectId) {
      setMessages((prev) => [...prev, msg]);
    }
  }, "newChatMessage");

  useEffect(() => {
    if (socket && projectId) {
      socket.emit("joinProject", projectId);
    }
  }, [socket, projectId]);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      chatApi.getMessages(projectId)
        .then(setMessages)
        .catch(() => toast.error("Failed to load chat history"))
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await chatApi.sendMessage(projectId, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-gray-500 text-sm animate-pulse">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-gray-900/30 rounded-2xl border border-gray-800/50 overflow-hidden">
      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-40">
            <Clock className="w-10 h-10 text-gray-600" />
            <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg._id} 
              className={`flex flex-col ${msg.senderId?._id === user?._id ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {msg.senderId?.username || "Unknown"}
                </span>
                <span className="text-[10px] text-gray-600">
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div 
                className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                  msg.senderId?._id === user?._id 
                    ? "bg-cyan-600 text-white rounded-tr-none shadow-lg shadow-cyan-900/20" 
                    : "bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSend}
        className="p-4 bg-gray-950/50 border-t border-gray-800 flex gap-2"
      >
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-gray-700"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
