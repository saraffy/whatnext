// Shared state functions
const storage = {
  setGoal: (goal) => localStorage.setItem('wdid_goal', goal),
  getGoal: () => localStorage.getItem('wdid_goal'),
  setPathway: (pathway) => localStorage.setItem('wdid_pathway', JSON.stringify(pathway)),
  getPathway: () => {
    const p = localStorage.getItem('wdid_pathway');
    return p ? JSON.parse(p) : null;
  },
  setRoadmap: (roadmap) => localStorage.setItem('wdid_roadmap', JSON.stringify(roadmap)),
  getRoadmap: () => {
    const r = localStorage.getItem('wdid_roadmap');
    return r ? JSON.parse(r) : null;
  },
  getCompleted: () => {
    const c = localStorage.getItem('wdid_completed');
    return c ? JSON.parse(c) : {};
  },
  setCompleted: (completed) => localStorage.setItem('wdid_completed', JSON.stringify(completed)),
  toggleTask: (day, taskIndex) => {
    const completed = storage.getCompleted();
    const key = `${day}-${taskIndex}`;
    completed[key] = !completed[key];
    storage.setCompleted(completed);
    return completed[key];
  },
  isTaskCompleted: (day, taskIndex) => {
    const completed = storage.getCompleted();
    return completed[`${day}-${taskIndex}`] || false;
  },
};

// Shared API functions
const api = {
  generatePathways: async (goal) => {
    const res = await fetch('/api/pathways', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
    });
    if (!res.ok) throw new Error('Failed to generate pathways');
    return res.json();
  },
  generateRoadmap: async (goal, pathway) => {
    const res = await fetch('/api/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, pathway }),
    });
    if (!res.ok) throw new Error('Failed to generate roadmap');
    return res.json();
  },
};
