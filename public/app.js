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

  // Multi-duration roadmap storage (with goal ID support)
  setRoadmapForDuration: (duration, roadmap, goalId = null) => {
    const id = goalId || storage.getActiveGoalId() || 'default';
    localStorage.setItem(`wdid_${id}_roadmap_${duration}`, JSON.stringify(roadmap));
  },
  getRoadmapForDuration: (duration, goalId = null) => {
    const id = goalId || storage.getActiveGoalId() || 'default';
    const r = localStorage.getItem(`wdid_${id}_roadmap_${duration}`);
    return r ? JSON.parse(r) : null;
  },

  // Current duration tracking
  setCurrentDuration: (duration) => localStorage.setItem('wdid_current_duration', duration),
  getCurrentDuration: () => localStorage.getItem('wdid_current_duration') || '1w',

  // Per-duration completion tracking (with goal ID support)
  getCompletedForDuration: (duration, goalId = null) => {
    const id = goalId || storage.getActiveGoalId() || 'default';
    const c = localStorage.getItem(`wdid_${id}_completed_${duration}`);
    return c ? JSON.parse(c) : {};
  },
  setCompletedForDuration: (duration, completed, goalId = null) => {
    const id = goalId || storage.getActiveGoalId() || 'default';
    localStorage.setItem(`wdid_${id}_completed_${duration}`, JSON.stringify(completed));
  },
  toggleTaskForDuration: (duration, period, taskIndex, goalId = null) => {
    const completed = storage.getCompletedForDuration(duration, goalId);
    const key = `${period}-${taskIndex}`;
    completed[key] = !completed[key];
    storage.setCompletedForDuration(duration, completed, goalId);
    return completed[key];
  },
  isTaskCompletedForDuration: (duration, period, taskIndex, goalId = null) => {
    const completed = storage.getCompletedForDuration(duration, goalId);
    return completed[`${period}-${taskIndex}`] || false;
  },

  // Legacy methods (for backward compatibility)
  setRoadmap: (roadmap, goalId = null) => storage.setRoadmapForDuration('1w', roadmap, goalId),
  getRoadmap: (goalId = null) => storage.getRoadmapForDuration('1w', goalId),
  getCompleted: (goalId = null) => storage.getCompletedForDuration('1w', goalId),
  setCompleted: (completed, goalId = null) => storage.setCompletedForDuration('1w', completed, goalId),
  toggleTask: (day, taskIndex, goalId = null) => storage.toggleTaskForDuration('1w', day, taskIndex, goalId),
  isTaskCompleted: (day, taskIndex, goalId = null) => storage.isTaskCompletedForDuration('1w', day, taskIndex, goalId),

  // Multi-goal support
  getGoalsList: () => {
    const list = localStorage.getItem('wdid_goals_list');
    return list ? JSON.parse(list) : [];
  },
  getActiveGoalId: () => localStorage.getItem('wdid_active_goal_id'),
  createGoal: (goal, summary) => {
    const id = 'goal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const list = storage.getGoalsList();
    list.push({
      id,
      goal,
      summary,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    });
    localStorage.setItem('wdid_goals_list', JSON.stringify(list));
    localStorage.setItem('wdid_active_goal_id', id);
    return id;
  },
  switchGoal: (goalId) => {
    const list = storage.getGoalsList();
    const goal = list.find(g => g.id === goalId);
    if (goal) {
      goal.lastActive = new Date().toISOString();
      localStorage.setItem('wdid_goals_list', JSON.stringify(list));
      localStorage.setItem('wdid_active_goal_id', goalId);
    }
  },
  deleteGoal: (goalId) => {
    let list = storage.getGoalsList();
    list = list.filter(g => g.id !== goalId);
    localStorage.setItem('wdid_goals_list', JSON.stringify(list));

    // Remove all goal-specific keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(`_${goalId}_`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // If deleted active goal, switch to first remaining goal
    const activeId = storage.getActiveGoalId();
    if (activeId === goalId && list.length > 0) {
      localStorage.setItem('wdid_active_goal_id', list[0].id);
    } else if (list.length === 0) {
      localStorage.removeItem('wdid_active_goal_id');
    }
  },

  // Override storage methods to support goal IDs
  _getGoalIdForStorage: () => {
    const activeId = storage.getActiveGoalId();
    return activeId || 'default';
  },

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

// Logout function
async function logout() {
  try {
    const { signOut } = await import('./firebase-config.js');
    const { auth } = await import('./firebase-config.js');
    await signOut(auth);
    // Clear localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wdid_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

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
  generateRoadmap: async (goal, braindumpOrPathway, duration = 'week') => {
    const res = await fetch('/api/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, braindump: braindumpOrPathway, duration }),
    });
    if (!res.ok) throw new Error('Failed to generate roadmap');
    return res.json();
  },
  getTaskHelp: async (goal, task, taskType) => {
    const res = await fetch('/api/task-help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, task, taskType }),
    });
    if (!res.ok) throw new Error('Failed to get task help');
    return res.json();
  },
};
