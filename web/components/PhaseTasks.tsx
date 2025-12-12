import React, { useState } from 'react';
import { ProjectState, Task } from '../types';
import { generateTasks } from '../services/geminiService';
import { ArrowRight, CheckSquare, Clock, ArrowUpRight, BarChart, ListTodo } from 'lucide-react';
import { BarChart as ReChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PhaseTasksProps {
  projectState: ProjectState;
  setProjectState: React.Dispatch<React.SetStateAction<ProjectState>>;
  onNext: () => void;
}

const PhaseTasks: React.FC<PhaseTasksProps> = ({ projectState, setProjectState, onNext }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    try {
      const tasks = await generateTasks(projectState.spec, projectState.plan);
      setProjectState(prev => ({ ...prev, tasks }));
    } catch (error) {
      alert("Failed to generate tasks.");
    } finally {
      setIsGenerating(false);
    }
  };

  const hasTasks = projectState.tasks.length > 0;

  // Chart data preparation
  const chartData = hasTasks ? [
    { name: 'S', count: projectState.tasks.filter(t => t.complexity === 'S').length },
    { name: 'M', count: projectState.tasks.filter(t => t.complexity === 'M').length },
    { name: 'L', count: projectState.tasks.filter(t => t.complexity === 'L').length },
  ] : [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {!hasTasks ? (
        <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
          <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
            <ListTodo className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-medium text-zinc-900 mb-3 tracking-tight">Project Roadmap</h2>
          <p className="text-zinc-500 max-w-md text-center mb-10 font-light leading-relaxed">
            Transform your architecture plan into a set of actionable, granular tasks ready for AI implementation.
          </p>
          <button 
            onClick={handleGenerateTasks}
            disabled={isGenerating}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-medium text-white transition-all transform duration-300 ${
              isGenerating ? 'bg-zinc-300 cursor-wait' : 'bg-zinc-900 hover:scale-105 hover:shadow-xl hover:shadow-zinc-900/20 active:scale-95'
            }`}
          >
            {isGenerating ? (
               <>
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 <span>Planning...</span>
               </>
            ) : 'Generate Implementation Plan'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-14rem)]">
          {/* Task List */}
          <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-[2.5rem] border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
             <div className="p-8 pb-4 flex items-center justify-between">
                <h3 className="text-xl font-medium text-zinc-900 tracking-tight">Backlog</h3>
                <span className="text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full font-medium">{projectState.tasks.length} Tasks</span>
             </div>
             <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-4">
                {projectState.tasks.map((task) => (
                  <div key={task.id} className="p-6 bg-white border border-zinc-100 rounded-3xl hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group">
                     <div className="flex items-start justify-between">
                       <div className="flex-1 pr-6">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-[10px] text-zinc-400">#{task.id}</span>
                            <h4 className="font-medium text-zinc-900 group-hover:text-black">{task.title}</h4>
                          </div>
                          <p className="text-sm text-zinc-500 font-light leading-relaxed line-clamp-2">{task.description}</p>
                       </div>
                       <div className="flex flex-col items-end gap-3 shrink-0">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                             task.complexity === 'S' ? 'bg-zinc-50 text-zinc-600 border-zinc-200' :
                             task.complexity === 'M' ? 'bg-zinc-50 text-zinc-600 border-zinc-200' :
                             'bg-zinc-50 text-zinc-600 border-zinc-200'
                          }`}>
                            {task.complexity}
                          </span>
                       </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Stats & Actions */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex-1">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-8">
                  Complexity
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChart data={chartData}>
                      <XAxis dataKey="name" fontSize={11} stroke="#d4d4d8" axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        cursor={{ fill: '#f4f4f5' }}
                      />
                      <Bar dataKey="count" fill="#18181b" radius={[6, 6, 6, 6]} barSize={32} />
                    </ReChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl shadow-zinc-900/10 text-zinc-300">
                <h3 className="text-lg font-medium text-white mb-2">Ready to Build?</h3>
                <p className="text-sm mb-8 text-zinc-400 font-light leading-relaxed">
                  The specifications and tasks are aligned. The AI is ready to generate the codebase.
                </p>
                <button 
                  onClick={onNext}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors font-medium active:scale-95"
                >
                  <span>Start Implementation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseTasks;