// Shared state functions
const storage = {
  // Goal management
  setGoal: (goal) => {
    localStorage.setItem('wdid_goal', goal);
    // Clear old roadmap/completion data for fresh start
    const durations = ['day', 'week', 'month', 'year'];
    durations.forEach(d => {
      localStorage.removeItem(`wdid_roadmap_${d}`);
      localStorage.removeItem(`wdid_completed_${d}`);
      for (let i = 1; i <= 12; i++) {
        localStorage.removeItem(`wdid_celebrated_${d}_${i}`);
      }
    });
  },
  getGoal: () => localStorage.getItem('wdid_goal'),

  // Summary and encouragement
  setSummaryData: (summary, encouragement, pathways) => {
    localStorage.setItem('wdid_summary', summary);
    localStorage.setItem('wdid_encouragement', encouragement);
    localStorage.setItem('wdid_pathways', JSON.stringify(pathways));
  },
  getSummary: () => {
    const summary = localStorage.getItem('wdid_summary');
    const encouragement = localStorage.getItem('wdid_encouragement');
    return { summary, encouragement };
  },
  getPathways: () => {
    const p = localStorage.getItem('wdid_pathways');
    return p ? JSON.parse(p) : null;
  },

  // Pathway selection
  setPathway: (pathway) => localStorage.setItem('wdid_pathway', JSON.stringify(pathway)),
  getPathway: () => {
    const p = localStorage.getItem('wdid_pathway');
    return p ? JSON.parse(p) : null;
  },

  // Multi-duration roadmap storage
  setRoadmapForDuration: (duration, roadmap) => {
    localStorage.setItem(`wdid_roadmap_${duration}`, JSON.stringify(roadmap));
  },
  getRoadmapForDuration: (duration) => {
    const r = localStorage.getItem(`wdid_roadmap_${duration}`);
    return r ? JSON.parse(r) : null;
  },

  // Current duration tracking
  setCurrentDuration: (duration) => localStorage.setItem('wdid_current_duration', duration),
  getCurrentDuration: () => localStorage.getItem('wdid_current_duration') || 'week',

  // Per-duration completion tracking
  getCompletedForDuration: (duration) => {
    const c = localStorage.getItem(`wdid_completed_${duration}`);
    return c ? JSON.parse(c) : {};
  },
  setCompletedForDuration: (duration, completed) => {
    localStorage.setItem(`wdid_completed_${duration}`, JSON.stringify(completed));
  },
  toggleTaskForDuration: (duration, period, taskIndex) => {
    const completed = storage.getCompletedForDuration(duration);
    const key = `${period}-${taskIndex}`;
    completed[key] = !completed[key];
    storage.setCompletedForDuration(duration, completed);
    return completed[key];
  },
  isTaskCompletedForDuration: (duration, period, taskIndex) => {
    const completed = storage.getCompletedForDuration(duration);
    return completed[`${period}-${taskIndex}`] || false;
  },

  // Legacy methods (for backward compatibility)
  setRoadmap: (roadmap) => storage.setRoadmapForDuration('week', roadmap),
  getRoadmap: () => storage.getRoadmapForDuration('week'),
  getCompleted: () => storage.getCompletedForDuration('week'),
  setCompleted: (completed) => storage.setCompletedForDuration('week', completed),
  toggleTask: (day, taskIndex) => storage.toggleTaskForDuration('week', day, taskIndex),
  isTaskCompleted: (day, taskIndex) => storage.isTaskCompletedForDuration('week', day, taskIndex),

  // Clear all data
  clearAll: () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wdid_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },
};

// Shared API functions
const api = {
  analyzeGoal: async (goal) => {
    const res = await fetch('/api/analyze-goal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
    });
    if (!res.ok) throw new Error('Failed to analyze goal');
    return res.json();
  },
  generatePathways: async (goal) => {
    const res = await fetch('/api/pathways', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
    });
    if (!res.ok) throw new Error('Failed to generate pathways');
    return res.json();
  },
  generateRoadmap: async (goal, pathway, duration = 'week') => {
    const res = await fetch('/api/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, pathway, duration }),
    });
    if (!res.ok) throw new Error('Failed to generate roadmap');
    return res.json();
  },
};
