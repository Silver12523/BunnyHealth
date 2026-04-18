const STORAGE_PREFIX = "bunnyhealth:daily-health-game";

export const HEALTH_TASK_POOL = [
  {
    id: "drink-water",
    title: "喝一杯水",
    description: "慢慢喝完一杯水，让小兔子恢复一点活力。",
    reward: { health: 2, exp: 5 }
  },
  {
    id: "push-up-10",
    title: "俯卧撑 10 个",
    description: "可以分两组完成，动作比速度更重要。",
    reward: { health: 3, exp: 8 }
  },
  {
    id: "walk-5-min",
    title: "走路 5 分钟",
    description: "离开座位走一走，顺便放松眼睛。",
    reward: { health: 3, exp: 8 }
  },
  {
    id: "stretch-neck",
    title: "颈肩拉伸 1 分钟",
    description: "轻轻转动肩颈，不要用力过猛。",
    reward: { health: 2, exp: 5 }
  },
  {
    id: "deep-breath",
    title: "深呼吸 5 次",
    description: "吸气、停顿、呼气，帮身体慢下来。",
    reward: { health: 1, exp: 4 }
  },
  {
    id: "stand-up",
    title: "站立活动 2 分钟",
    description: "站起来活动腿脚，避免久坐。",
    reward: { health: 2, exp: 5 }
  },
  {
    id: "fruit",
    title: "吃一份水果",
    description: "补一点维生素，今天的小兔子会很开心。",
    reward: { health: 3, exp: 8 }
  },
  {
    id: "eye-rest",
    title: "远眺 30 秒",
    description: "看向远处，让眼睛休息一下。",
    reward: { health: 1, exp: 4 }
  }
];

export function getLocalDateKey(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

export function getDailyGameStorageKey(userId = "guest", dateKey = getLocalDateKey()) {
  return `${STORAGE_PREFIX}:${userId}:${dateKey}`;
}

export function createDailyGameState({
  userId = "guest",
  dateKey = getLocalDateKey(),
  taskCount = 2
} = {}) {
  const tasks = pickDailyTasks({ userId, dateKey, taskCount }).map((task) => ({
    ...task,
    completed: false
  }));

  return {
    userId,
    dateKey,
    tasks,
    totalReward: { health: 0, exp: 0 },
    completedAt: null
  };
}

export function readDailyGameState({
  userId = "guest",
  dateKey = getLocalDateKey(),
  storage = getBrowserStorage()
} = {}) {
  const fallbackState = createDailyGameState({ userId, dateKey });

  if (!storage) {
    return fallbackState;
  }

  const rawState = storage.getItem(getDailyGameStorageKey(userId, dateKey));
  if (!rawState) {
    writeDailyGameState(fallbackState, { storage });
    return fallbackState;
  }

  try {
    return JSON.parse(rawState);
  } catch {
    writeDailyGameState(fallbackState, { storage });
    return fallbackState;
  }
}

export function writeDailyGameState(state, { storage = getBrowserStorage() } = {}) {
  if (!storage) {
    return;
  }

  storage.setItem(
    getDailyGameStorageKey(state.userId, state.dateKey),
    JSON.stringify(state)
  );
}

export function completeDailyTask(state, taskId, completedAt = new Date()) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || task.completed) {
    return state;
  }

  const tasks = state.tasks.map((item) =>
    item.id === taskId ? { ...item, completed: true } : item
  );
  const allCompleted = tasks.every((item) => item.completed);

  return {
    ...state,
    tasks,
    totalReward: {
      health: state.totalReward.health + task.reward.health,
      exp: state.totalReward.exp + task.reward.exp
    },
    completedAt: allCompleted ? completedAt.toISOString() : state.completedAt
  };
}

export function isDailyGameComplete(state) {
  return state.tasks.length > 0 && state.tasks.every((task) => task.completed);
}

function pickDailyTasks({ userId, dateKey, taskCount }) {
  const random = createSeededRandom(`${dateKey}:${userId}`);
  const tasks = [...HEALTH_TASK_POOL];

  for (let index = tasks.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [tasks[index], tasks[swapIndex]] = [tasks[swapIndex], tasks[index]];
  }

  return tasks.slice(0, taskCount);
}

function createSeededRandom(seedText) {
  let seed = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    seed ^= seedText.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }

  return function nextRandom() {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}
