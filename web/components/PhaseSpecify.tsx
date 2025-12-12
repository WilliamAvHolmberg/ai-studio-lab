import React, { useState } from 'react';
import { ProjectState, Specification } from '../types';
import { generateSpecification } from '../services/geminiService';
import { Sparkles, User, AlertCircle, CheckCircle2, ArrowRight, MessageSquarePlus, Send } from 'lucide-react';

interface PhaseSpecifyProps {
  projectState: ProjectState;
  setProjectState: React.Dispatch<React.SetStateAction<ProjectState>>;
  onNext: () => void;
}

const PhaseSpecify: React.FC<PhaseSpecifyProps> = ({ projectState, setProjectState, onNext }) => {
  const [description, setDescription] = useState(projectState.spec.description);
  const [isGenerating, setIsGenerating] = useState(false);
  const [clarification, setClarification] = useState('');

  const handleGenerate = async (descToUse?: string) => {
    const finalDesc = descToUse || description;
    if (!finalDesc.trim()) return;
    
    setIsGenerating(true);
    try {
      const generatedSpec = await generateSpecification(finalDesc);
      setProjectState(prev => ({
        ...prev,
        spec: {
          ...prev.spec,
          description: finalDesc,
          ...generatedSpec
        }
      }));
    } catch (error) {
      alert("Failed to generate specification. Please check your API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendClarification = () => {
    if (!clarification.trim()) return;
    const newDescription = `${description}\n\n[Clarification]: ${clarification}`;
    setDescription(newDescription);
    setClarification('');
    handleGenerate(newDescription);
  };

  const hasSpec = projectState.spec.requirements.length > 0;
  const followUpQuestions = projectState.spec.followUpQuestions || [];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* Input Section */}
      <section className="group">
        <div className="flex justify-between items-end mb-4 px-1">
          <div>
            <h2 className="text-xl font-medium text-zinc-900 tracking-tight">Vision</h2>
            <p className="text-zinc-500 mt-1 font-light">What are we building today?</p>
          </div>
          {hasSpec && (
             <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50/50 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100">
               <CheckCircle2 className="w-3.5 h-3.5" />
               <span>Specification Ready</span>
             </div>
          )}
        </div>
        
        <div className="relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 transition-all duration-300 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:border-zinc-200 overflow-hidden">
          <textarea
            className="w-full h-48 p-8 rounded-3xl border-none focus:ring-0 resize-none text-zinc-800 placeholder-zinc-300 text-lg leading-relaxed bg-transparent font-light"
            placeholder="Describe your product vision..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="absolute bottom-6 right-6">
             <button 
               onClick={() => handleGenerate()}
               disabled={isGenerating || !description}
               className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-all duration-500 ${
                 isGenerating ? 'bg-zinc-300 cursor-wait' : 'bg-black hover:scale-105 active:scale-95 shadow-lg shadow-zinc-900/20'
               }`}
             >
               {isGenerating ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   <span className="text-sm">Thinking...</span>
                 </>
               ) : (
                 <>
                   <Sparkles className="w-4 h-4" />
                   <span className="text-sm">{hasSpec ? 'Refine' : 'Generate'}</span>
                 </>
               )}
             </button>
          </div>
        </div>
      </section>

      {/* AI Follow-up Questions */}
      {followUpQuestions.length > 0 && !isGenerating && (
        <section className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <MessageSquarePlus className="w-32 h-32 text-zinc-900" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <h3 className="font-medium text-zinc-900 flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-zinc-500" />
              Clarification Needed
            </h3>
            
            <div className="space-y-4 mb-8">
              {followUpQuestions.map((q, i) => (
                <div key={i} className="flex gap-4 items-start text-zinc-700 font-normal">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center text-xs font-medium mt-0.5">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed">{q}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 bg-zinc-50/50 p-2 rounded-2xl border border-zinc-100 focus-within:bg-white focus-within:shadow-md focus-within:border-zinc-200 transition-all duration-300">
              <input 
                type="text" 
                value={clarification}
                onChange={(e) => setClarification(e.target.value)}
                placeholder="Answer to refine requirements..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendClarification()}
                className="flex-1 px-4 py-2 bg-transparent border-none outline-none text-zinc-900 placeholder-zinc-400"
              />
              <button 
                onClick={handleSendClarification}
                disabled={!clarification.trim()}
                className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-black disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Generated Spec Visualization */}
      {hasSpec && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Personas */}
          <section className="lg:col-span-4 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Personas</h3>
            <div className="grid gap-5">
              {projectState.spec.personas.map((persona, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-zinc-900">{persona.role}</h4>
                    <span className="w-8 h-8 rounded-full bg-zinc-50 text-zinc-500 flex items-center justify-center text-xs font-bold group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                      {persona.role[0]}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-4">{persona.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {persona.painPoints.map((point, i) => (
                      <span key={i} className="px-2.5 py-1 bg-zinc-50 text-zinc-600 text-[10px] font-medium rounded-md border border-zinc-100">
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Requirements */}
          <section className="lg:col-span-8 space-y-6">
             <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Requirements</h3>
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
               <div className="divide-y divide-zinc-50">
                 {projectState.spec.requirements.map((req) => (
                   <div key={req.id} className="p-6 hover:bg-zinc-50/50 transition-colors group">
                     <div className="flex items-center justify-between mb-2">
                       <span className="font-mono text-[10px] text-zinc-300 group-hover:text-zinc-400 transition-colors">#{req.id}</span>
                       <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                         req.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                         req.priority === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                         'bg-zinc-100 text-zinc-600 border-zinc-200'
                       }`}>
                         {req.priority}
                       </span>
                     </div>
                     <h4 className="text-base font-medium text-zinc-900 mb-1">{req.title}</h4>
                     <p className="text-sm text-zinc-500 leading-relaxed font-light">{req.description}</p>
                   </div>
                 ))}
               </div>
            </div>

            {/* Success Criteria */}
            <div className="bg-zinc-900 text-zinc-300 p-8 rounded-3xl mt-6 shadow-xl shadow-zinc-900/10">
               <h4 className="font-medium mb-4 text-white tracking-tight">Success Criteria</h4>
               <ul className="grid gap-3">
                 {projectState.spec.successCriteria.map((crit, i) => (
                   <li key={i} className="flex items-start gap-3 text-sm font-light">
                     <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                     {crit}
                   </li>
                 ))}
               </ul>
            </div>
            
            <div className="pt-8 flex justify-end">
              <button 
                onClick={onNext}
                className="flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 border border-zinc-200 rounded-full hover:bg-zinc-50 transition-all font-medium shadow-sm hover:shadow-md active:scale-95"
              >
                <span>Proceed to Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default PhaseSpecify;