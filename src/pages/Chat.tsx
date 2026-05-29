import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAI } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { MissingPerson } from '../types';
import { CaseCard } from '../components/ui/CaseCard';
import { MessageSquare, Send, Bot, User, Sparkles, Brain, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'bot';
  content: string;
  results?: MissingPerson[];
}

export function Chat() {
  const [searchParams] = useSearchParams();
  const isFoundMode = searchParams.get('mode') === 'found';
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      content: isFoundMode 
        ? "I understand you've found someone who might be lost. Please describe them to me. Any details like what they say their parents' names are, where they say they are from, or landmarks they describe will help me find their family."
        : "Hello! I'm Lapata AI Assistant. Tell me about someone you're looking for (e.g., 'Boy missing from Rohini, wears blue shirt, mother name Sunita') and I'll search our database." 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const extractSearchInfo = async (text: string) => {
    try {
      const prompt = `
        Extract key search entities from this text to help find a missing person in a database:
        "${text}"
        
        Return ONLY a JSON object with:
        - name (string)
        - fatherName (string)
        - motherName (string)
        - location (string)
        - age (number)
        - gender (string)
        
        If a field is not present, use null.
      `;
      
      const ai = getAI();
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      
      const textResponse = result.text;
      if (!textResponse) return {};
      
      // Simple JSON extraction to be safe
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return {};
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("AI Error:", error);
      return {};
    }
  };

  const findMatches = async (info: any) => {
    const { data, error } = await supabase
      .from('missing_persons')
      .select('*')
      .eq('status', 'ACTIVE');

    if (error) throw error;
    const allCases = (data || []) as MissingPerson[];
    
    // Simple heuristic matching
    return allCases.filter(c => {
      let score = 0;
      if (info.name && c.fullName.toLowerCase().includes(info.name.toLowerCase())) score += 5;
      if (info.motherName && c.motherName?.toLowerCase().includes(info.motherName.toLowerCase())) score += 10;
      if (info.fatherName && c.fatherName?.toLowerCase().includes(info.fatherName.toLowerCase())) score += 10;
      if (info.location && (c.locality?.toLowerCase().includes(info.location.toLowerCase()) || c.village?.toLowerCase().includes(info.location.toLowerCase()))) score += 3;
      return score >= 5;
    }).slice(0, 4);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const info = await extractSearchInfo(userMsg);
      const results = await findMatches(info);
      
      let responseContent = "";
      if (results.length > 0) {
        responseContent = `I found ${results.length} potential matches based on your details. Please review them carefully.`;
      } else {
        responseContent = "I couldn't find a direct match in our active reports yet. Try providing more specific memory fragments like parents' names, village, or landmarks.";
      }
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: responseContent,
        results: results.length > 0 ? results : undefined
      }]);
    } catch (error) {
      toast.error('AI logic failed. Please try simple search.');
      setMessages(prev => [...prev, { role: 'bot', content: "I'm having some trouble processing that. Please try our standard search page." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col h-[calc(100vh-160px)]">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full">
        {/* Chat Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold tracking-wide uppercase">AI Reconnect Assistant</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Live Context Matcher</span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto pr-4 p-6 space-y-6 bg-slate-50 custom-scrollbar">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${m.role === 'user' ? 'ml-auto' : ''}`}>
                 <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
                   m.role === 'user' 
                   ? 'bg-blue-600 text-white rounded-tr-none' 
                   : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                 }`}>
                   {m.content}
                 </div>
                 
                 {m.results && m.results.length > 0 && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {m.results.map(r => (
                        <div key={r.id} className="w-full">
                           <CaseCard person={r} />
                        </div>
                      ))}
                   </div>
                 )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-3 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Analyzing memory fragments...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form onSubmit={handleSend} className="relative">
            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-5 py-3 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Type memory details (e.g. 'Found girl near metro, says village is Rohini')..."
                className="flex-1 bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="text-blue-600 hover:scale-110 transition-transform disabled:opacity-30"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
