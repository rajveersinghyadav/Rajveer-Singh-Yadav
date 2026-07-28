import { useState, useRef, useEffect } from "react";
import { TopBar } from "../components/TopBar";
import { BottomNav } from "../components/BottomNav";
import { useAnalysis } from "../hooks/useAnalysis";
import { Send, Bot, User, Zap } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export default function AiChatPage() {
  const { analysis, isConnected } = useAnalysis();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'System online. I am RJAnalyser AI. How can I assist with your trading analysis today?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate AI response based on current context
    setTimeout(() => {
      let response = "I am processing the current market conditions.";
      const query = userMsg.content.toLowerCase();

      if (query.includes('signal') || query.includes('buy') || query.includes('sell') || query.includes('what should i do')) {
        if (analysis) {
          response = `Current signal is **${analysis.signal}** with ${analysis.confidence}% confidence. ${analysis.reason}`;
        } else {
          response = "I am still gathering enough candlestick data to form a reliable signal. Please wait.";
        }
      } else if (query.includes('trend')) {
        if (analysis) {
          response = `The overall trend is **${analysis.trend.state}** with a strength of ${analysis.trend.strength}%.`;
        } else {
          response = "Trend analysis is currently initializing.";
        }
      } else if (query.includes('target') || query.includes('tp') || query.includes('stop')) {
        if (analysis && analysis.signal !== 'WAIT') {
          response = `For a ${analysis.signal} entry at ${analysis.entry.toFixed(5)}, I suggest a Stop Loss at ${analysis.stopLoss.toFixed(5)} and TP1 at ${analysis.tp1.toFixed(5)}. Risk/Reward ratio is ${analysis.riskReward.toFixed(2)}.`;
        } else {
          response = "No active valid signal to project targets for. Wait for a solid setup.";
        }
      } else {
        response = `My primary directive is market analysis. Based on my current data${analysis ? `, I'm seeing a ${analysis.trend.state} structure.` : '.'} Ask me for the latest signal, trend, or targets.`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col pt-[65px] pb-[70px]">
      <TopBar isConnected={isConnected} />
      
      {/* Engine Status */}
      <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">AI Engine Status</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-mono text-success uppercase">Learning / Active</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
              msg.role === 'ai' ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-secondary border-border text-muted-foreground'
            }`}>
              {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`p-3 rounded-lg text-sm font-mono leading-relaxed ${
              msg.role === 'ai' ? 'bg-card border border-border text-card-foreground rounded-tl-none' : 'bg-primary text-primary-foreground rounded-tr-none'
            }`}>
              {msg.content.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-card border-t border-border flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask RJAnalyser..."
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary transition-colors"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
