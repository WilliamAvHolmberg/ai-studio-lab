import React, { useState } from 'react';
import { ProjectState, Task } from '../types';
import { generateTaskCode } from '../services/geminiService';
import { Play, Copy, Check, Terminal, Code2, Loader2, Maximize2, FileCode } from 'lucide-react';

interface PhaseImplementProps {
  projectState: ProjectState;
  setProjectState: React.Dispatch<React.SetStateAction<ProjectState>>;
}

const PhaseImplement: React.FC<PhaseImplementProps> = ({ projectState, setProjectState }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = async (task: Task) => {
    setIsGenerating(true);
    setSelectedTask(task); 
    
    if (task.generatedCode) {
        setIsGenerating(false);
        return;
    }

    try {
      const code = await generateTaskCode(task, projectState.plan);
      const updatedTasks = projectState.tasks.map(t => 
        t.id === task.id ? { ...t, generatedCode: code, status: 'Review' as const } : t
      );
      
      setProjectState(prev => ({ ...prev, tasks: updatedTasks }));
      setSelectedTask(prev => prev ? { ...prev, generatedCode: code, status: 'Review' } : null);

    } catch (error) {
      alert("Failed to generate code.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (selectedTask?.generatedCode) {
      navigator.clipboard.writeText(selectedTask.generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const uncompletedTasks = projectState.tasks.filter(t => t.status === 'Todo');
  const reviewTasks = projectState.tasks.filter(t => t.status === 'Review' || t.status === 'Done');

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Task List Sidebar */}
      <div className="w-80 flex flex-col bg-white rounded-[2rem] border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden shrink-0">
        <div className="p-6 border-b border-zinc-50">
           <h3 className="font-medium text-zinc-900 tracking-tight">Tasks</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           
           {/* Todo */}
           <div>
             <h4 className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">To Do</h4>
             <div className="space-y-2">
               {uncompletedTasks.map(task => (
                 <button
                   key={task.id}
                   onClick={() => handleGenerateCode(task)}
                   className={`w-full text-left p-4 rounded-2xl text-sm transition-all border group ${
                     selectedTask?.id === task.id 
                       ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' 
                       : 'bg-white border-transparent hover:bg-zinc-50 hover:border-zinc-200 text-zinc-600'
                   }`}
                 >
                   <div className="flex items-center justify-between mb-2">
                     <span className={`font-mono text-[10px] opacity-60`}>#{task.id}</span>
                     <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        selectedTask?.id === task.id 
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-300' 
                        : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                     }`}>{task.complexity}</span>
                   </div>
                   <div className="font-medium truncate leading-relaxed">{task.title}</div>
                 </button>
               ))}
               {uncompletedTasks.length === 0 && <p className="text-xs text-zinc-400 px-3 italic">All tasks completed</p>}
             </div>
           </div>

           {/* Review */}
           <div>
             <h4 className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">In Review</h4>
             <div className="space-y-2">
               {reviewTasks.map(task => (
                 <button
                   key={task.id}
                   onClick={() => setSelectedTask(task)}
                   className={`w-full text-left p-4 rounded-2xl text-sm transition-all border ${
                     selectedTask?.id === task.id 
                       ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' 
                       : 'bg-white border-transparent hover:bg-zinc-50 hover:border-zinc-200 text-zinc-600'
                   }`}
                 >
                   <div className="flex items-center justify-between mb-2">
                     <span className="font-mono text-[10px] opacity-60">#{task.id}</span>
                     <Check className="w-3 h-3 text-emerald-500" />
                   </div>
                   <div className="font-medium truncate leading-relaxed">{task.title}</div>
                 </button>
               ))}
             </div>
           </div>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-zinc-900/5">
         {selectedTask ? (
           <>
             <div className="h-14 bg-[#1e1e1e] flex items-center justify-between px-6 border-b border-[#2d2d2d]">
               <div className="flex items-center gap-4">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                 </div>
                 <div className="h-4 w-[1px] bg-[#333]"></div>
                 <div className="flex items-center gap-2 text-zinc-400">
                    <FileCode className="w-4 h-4" />
                    <span className="text-xs font-mono truncate">
                        src/components/{selectedTask.id}.tsx
                    </span>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-[#2d2d2d] rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Copy Code"
                  >
                   {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                 </button>
               </div>
             </div>
             
             <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
               {isGenerating && !selectedTask.generatedCode ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1e1e] z-10">
                   <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                   <p className="text-zinc-500 font-mono text-xs animate-pulse tracking-widest uppercase">Generating</p>
                 </div>
               ) : (
                 <pre className="h-full w-full overflow-auto p-8 text-sm font-mono leading-relaxed text-[#d4d4d4] selection:bg-[#264f78]">
                   <code>{selectedTask.generatedCode}</code>
                 </pre>
               )}
             </div>

             <div className="h-14 bg-[#1e1e1e] border-t border-[#2d2d2d] px-6 flex items-center justify-between">
                <div className="text-xs text-zinc-600 font-medium">Ln 1, Col 1</div>
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition-colors">
                  <Play className="w-3 h-3" /> Execute
                </button>
             </div>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-zinc-700">
             <Code2 className="w-20 h-20 mb-6 opacity-10" />
             <p className="text-base font-light">Select a task to implement</p>
           </div>
         )}
      </div>

    </div>
  );
};

export default PhaseImplement;