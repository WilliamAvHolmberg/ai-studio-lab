import React from 'react';
import { Phase } from '../types';
import { 
  FileText, 
  Map, 
  CheckSquare, 
  Code2, 
  Layers, 
  Settings,
  Sparkles,
  Command
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPhase: Phase;
  onPhaseChange: (phase: Phase) => void;
  projectName: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPhase, onPhaseChange, projectName }) => {
  
  const navItems = [
    { phase: Phase.SPECIFY, label: 'Specify', icon: FileText },
    { phase: Phase.PLAN, label: 'Plan', icon: Map },
    { phase: Phase.TASKS, label: 'Tasks', icon: CheckSquare },
    { phase: Phase.IMPLEMENT, label: 'Implement', icon: Code2 },
  ];

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-zinc-900 overflow-hidden selection:bg-zinc-900 selection:text-white">
      {/* Sidebar - Light, Minimal, Translucent feel */}
      <aside className="w-[280px] flex flex-col border-r border-zinc-200/60 bg-[#FBFBFB] shrink-0">
        <div className="p-8 pb-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-900/10">
            <Layers className="text-white w-4 h-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-zinc-900">SpecFlow</span>
        </div>

        <div className="px-4 mb-6">
          <div className="bg-white border border-zinc-200/60 rounded-xl p-3 shadow-sm flex items-center gap-3 transition-all hover:border-zinc-300 cursor-pointer">
             <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 text-xs font-bold border border-zinc-100">
                JD
             </div>
             <div className="flex-1 min-w-0">
               <div className="text-sm font-medium text-zinc-900 truncate">{projectName || 'New Project'}</div>
               <div className="text-[11px] text-zinc-500 font-medium">Alpha Build</div>
             </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-4 mb-2 mt-4">Development Phase</div>
          {navItems.map((item) => {
            const isActive = currentPhase === item.phase;
            return (
              <button
                key={item.phase}
                onClick={() => onPhaseChange(item.phase)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-white text-zinc-900 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-zinc-200/50' 
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50'
                }`}
              >
                <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-zinc-900 rounded-r-full" />}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-zinc-200/60">
           <button className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 text-sm font-medium transition-colors w-full">
             <Settings className="w-4 h-4" />
             <span>Settings</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-white rounded-l-[2rem] shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.03)] border-l border-zinc-100 my-2 mr-2">
        <header className="h-20 px-8 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
           <div className="flex items-center gap-4">
              <h1 className="text-2xl font-light tracking-tight text-zinc-900">
                {currentPhase.charAt(0) + currentPhase.slice(1).toLowerCase()}
              </h1>
           </div>
           
           <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10 text-sm font-medium hover:scale-105 active:scale-95">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Assistant</span>
             </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-12 pt-4 relative">
          <div className="max-w-5xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;