
import React, { useState, useRef, useEffect } from 'react';
import { generateBusinessAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, Sparkles, Loader2, Paperclip, Image as ImageIcon } from 'lucide-react';

const StrategyAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Namaste! I am your AI Business Consultant. Ask me about scaling your business in the Netherlands, marketing strategies for Indian food, or upload a document/menu for me to review.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setAttachment(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSend = async () => {
    if (!input.trim() && !attachment) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: Date.now(),
      attachmentUrl: attachment || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachment(null);
    setLoading(true);

    // Simulate context derived from other parts of the app (mock data for now)
    const context = `
      Business Type: Cloud Kitchen in Netherlands
      Cuisine: Indian Home Cooked (Tiffin focus)
      Current Revenue: €12k/month
      Top Seller: Butter Chicken, Dal Makhani
      Challenges: Logistics, Customer Acquisition
    `;
    
    // Note: Real vision capabilities would require updating generateBusinessAdvice to accept image data
    // For now we treat it as a text prompt with context about the image being attached
    const prompt = attachment ? `[User uploaded an image] ${userMsg.text}` : userMsg.text;

    const aiResponseText = await generateBusinessAdvice(prompt, context);

    const aiMsg: ChatMessage = {
      role: 'model',
      text: aiResponseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const suggestionChips = [
    "How do I market Tiffin service in Amsterdam?",
    "Regulations for home kitchens in NL?",
    "Cost calculation for Butter Chicken",
    "Strategy for corporate catering"
  ];

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">AI Strategy Advisor</h2>
            <p className="text-sm text-gray-500">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-teal-600 text-white'
            }`}>
              {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-gray-800 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
            }`}>
              {msg.attachmentUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden">
                      <img src={msg.attachmentUrl} alt="User attachment" className="max-h-48 w-auto" />
                  </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
               <Loader2 className="animate-spin text-teal-600" size={20} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        {messages.length < 3 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {suggestionChips.map(chip => (
              <button
                key={chip}
                onClick={() => setInput(chip)}
                className="text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-teal-200"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
        
        {attachment && (
            <div className="mb-2 flex items-center gap-2 bg-gray-100 p-2 rounded-lg max-w-fit">
                <ImageIcon size={16} className="text-teal-600" />
                <span className="text-xs text-gray-600">Image Attached</span>
                <button onClick={() => setAttachment(null)} className="text-gray-400 hover:text-red-500 ml-2">&times;</button>
            </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-teal-600 bg-gray-50 hover:bg-teal-50 rounded-xl transition-colors"
          >
              <Paperclip size={20} />
          </button>
          <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/*"
             onChange={handleFileSelect} 
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about scaling, taxes, or menu pricing..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !attachment)}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyAdvisor;