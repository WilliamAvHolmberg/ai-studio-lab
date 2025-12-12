export enum Phase {
  SPECIFY = 'SPECIFY',
  PLAN = 'PLAN',
  TASKS = 'TASKS',
  IMPLEMENT = 'IMPLEMENT',
}

export interface Persona {
  role: string;
  description: string;
  painPoints: string[];
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Specification {
  description: string;
  personas: Persona[];
  requirements: Requirement[];
  successCriteria: string[];
  followUpQuestions?: string[];
}

export interface ArchitectureComponent {
  name: string;
  type: 'Frontend' | 'Backend' | 'Database' | 'Service';
  tech: string;
  description: string;
}

export interface ArchitecturePlan {
  overview: string;
  stack: string[];
  components: ArchitectureComponent[];
  databaseSchema: string; // Simplified markdown representation
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  complexity: 'S' | 'M' | 'L';
  assignedTo: string; // 'AI' or 'User'
  generatedCode?: string;
}

export interface ProjectState {
  name: string;
  currentPhase: Phase;
  spec: Specification;
  plan: ArchitecturePlan;
  tasks: Task[];
  isGenerating: boolean;
  lastUpdated: Date;
}
