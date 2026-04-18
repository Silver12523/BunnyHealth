import { useEffect, useState } from "react";
import {
  completeDailyTask,
  isDailyGameComplete,
  readDailyGameState,
  writeDailyGameState
} from "./healthGameLogic";

export default function DailyHealthGame({
  userId = "guest",
  onReward,
  onBackHome
}) {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    setGameState(readDailyGameState({ userId }));
  }, [userId]);

  if (!gameState) {
    return <main className="daily-game">今日任务加载中...</main>;
  }

  const allCompleted = isDailyGameComplete(gameState);

  function handleCompleteTask(taskId) {
    const task = gameState.tasks.find((item) => item.id === taskId);
    const nextState = completeDailyTask(gameState, taskId);

    writeDailyGameState(nextState);
    setGameState(nextState);

    if (task && !task.completed && onReward) {
      onReward(task.reward, nextState);
    }
  }

  return (
    <main className="daily-game">
      <section className="daily-game__header">
        <p className="daily-game__eyebrow">每日健康小游戏</p>
        <h1>今天帮小兔子完成 2 个健康任务</h1>
        <p>
          完成任务会增加健康度和经验值。每天的任务会按日期自动刷新。
        </p>
      </section>

      <section className="daily-game__tasks" aria-label="今日健康任务">
        {gameState.tasks.map((task) => (
          <article className="daily-game__task" key={task.id}>
            <div>
              <h2>{task.title}</h2>
              <p>{task.description}</p>
              <p>
                健康度 +{task.reward.health} / 经验 +{task.reward.exp}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCompleteTask(task.id)}
              disabled={task.completed}
            >
              {task.completed ? "已完成" : "完成任务"}
            </button>
          </article>
        ))}
      </section>

      <section className="daily-game__result" aria-live="polite">
        <h2>今日奖励</h2>
        <p>
          健康度 +{gameState.totalReward.health} / 经验 +
          {gameState.totalReward.exp}
        </p>
        {allCompleted ? <p>今日任务完成，小兔子状态变好啦。</p> : null}
      </section>

      {onBackHome ? (
        <button type="button" onClick={onBackHome}>
          返回家园
        </button>
      ) : null}
    </main>
  );
}
