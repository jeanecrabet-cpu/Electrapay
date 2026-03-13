
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, HelpCircle, ArrowLeft } from 'lucide-react';
import { getAISupport } from '../services/gemini';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface GeminiSupportProps {
  onBack: () => void;
}

export const GeminiSupport: React.FC<GeminiSupportProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Bonjour ! Je suis l\'assistant IA d\'ElectraPay. Comment puis-je vous aider aujourd\'hui ? (ex: "Où trouver mon numéro de compteur ?", "Mon code ne marche pas")' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const botResponse = await getAISupport(userMsg);
    setMessages(prev => [...prev, { role: 'bot', text: botResponse || 'Désolé, une erreur est survenue.' }]);
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto h-[600px] flex flex-col bg-white rounded-2xl border shadow-sm overflow-hidden animate-fadeIn">
      <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <HelpCircle className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Support AI ElectraPay</h2>
            <p className="text-xs text-green-500 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              En ligne - IA active
            </p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-sm"
        >
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl flex gap-3 ${
              m.role === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-white border text-slate-800 rounded-bl-none shadow-sm'
            }`}>
              <div className="shrink-0">
                {m.role === 'user' ? <User size={18} /> : <Bot size={18} className="text-orange-500" />}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-orange-200 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Écrivez votre question ici..."
            className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:border-orange-500 transition-colors bg-slate-50"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-orange-500 disabled:bg-slate-200 text-white p-3 rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
