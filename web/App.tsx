import React, { useState } from 'react';
import { ProjectState, Phase } from './types';
import Layout from './components/Layout';
import PhaseSpecify from './components/PhaseSpecify';
import PhasePlan from './components/PhasePlan';
import PhaseTasks from './components/PhaseTasks';
import PhaseImplement from './components/PhaseImplement';

const INITIAL_STATE: ProjectState = {
  name: 'New Project',
  currentPhase: Phase.SPECIFY,
  isGenerating: false,
  lastUpdated: new Date(),
  spec: {
    description: '',
    personas: [],
    requirements: [],
    successCriteria: [],
  },
  plan: {
    overview: '',
    stack: [],
    components: [],
    databaseSchema: '',
  },
  tasks: [],
};

const App: React.FC = () => {
  const [projectState, setProjectState] = useState<ProjectState>(INITIAL_STATE);

  const handlePhaseChange = (phase: Phase) => {
    setProjectState((prev) => ({ ...prev, currentPhase: phase }));
  };

  const renderPhase = () => {
    switch (projectState.currentPhase) {
      case Phase.SPECIFY:
        return (
          <PhaseSpecify 
            projectState={projectState} 
            setProjectState={setProjectState} 
            onNext={() => handlePhaseChange(Phase.PLAN)}
          />
        );
      case Phase.PLAN:
        return (
          <PhasePlan 
            projectState={projectState} 
            setProjectState={setProjectState}
            onNext={() => handlePhaseChange(Phase.TASKS)}
          />
        );
      case Phase.TASKS:
        return (
          <PhaseTasks 
            projectState={projectState} 
            setProjectState={setProjectState}
            onNext={() => handlePhaseChange(Phase.IMPLEMENT)}
          />
        );
      case Phase.IMPLEMENT:
        return (
          <PhaseImplement 
            projectState={projectState} 
            setProjectState={setProjectState}
          />
        );
      default:
        return <div>Unknown Phase</div>;
    }
  };

  return (
    <Layout 
      currentPhase={projectState.currentPhase} 
      onPhaseChange={handlePhaseChange}
      projectName={projectState.name}
    >
      {renderPhase()}
    </Layout>
  );
};

export default App;
