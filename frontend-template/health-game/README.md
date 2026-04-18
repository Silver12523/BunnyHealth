# 每日健康小游戏模板

这个目录是给未来前端项目预留的模板，不依赖当前后端代码，也不会自动接入现有页面。

## 已实现的能力

- 每天按 `userId + 日期` 固定随机生成 2 个轻量健康任务。
- 任务状态保存在浏览器 `localStorage`，刷新页面不会丢失。
- 每个任务完成后增加健康度和经验值。
- 通过 `onReward` 回调预留后端接入口。

## 文件说明

- `healthGameLogic.js`：任务池、每日随机、读写本地存储、完成任务逻辑。
- `DailyHealthGame.jsx`：可直接放进 React 或 Next.js 的组件。
- `HealthGameEntryButton.jsx`：可放在家园页的入口按钮。

## 家园页入口按钮示例

```jsx
import HealthGameEntryButton from "./components/HealthGameEntryButton";

export default function HomePage({ navigate }) {
  return (
    <HealthGameEntryButton onEnter={() => navigate("/health-game")} />
  );
}
```

## React Router 接入示例

```jsx
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import DailyHealthGame from "./components/DailyHealthGame";

function HealthGamePage() {
  const navigate = useNavigate();

  return (
    <DailyHealthGame
      userId="1"
      onReward={(reward) => {
        console.log("TODO: call backend reward API", reward);
      }}
      onBackHome={() => navigate("/")}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/health-game" element={<HealthGamePage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Next.js 接入示例

把组件复制到：

```text
frontend/components/DailyHealthGame.jsx
frontend/components/healthGameLogic.js
```

然后创建页面：

```jsx
"use client";

import { useRouter } from "next/navigation";
import DailyHealthGame from "@/components/DailyHealthGame";

export default function HealthGamePage() {
  const router = useRouter();

  return (
    <DailyHealthGame
      userId="1"
      onReward={(reward) => {
        console.log("TODO: call backend reward API", reward);
      }}
      onBackHome={() => router.push("/")}
    />
  );
}
```

页面路径建议：

```text
frontend/app/health-game/page.jsx
```

## 后续接入后端时建议新增

可以在 FastAPI 中新增两个接口：

- `GET /daily-health-game/{user_id}`：获取今日任务和完成状态。
- `POST /daily-health-game/{user_id}/complete`：完成任务，更新 `pets.health_hp` 和 `pets.exp`。

模板里的 `onReward` 可以替换成真实请求：

```jsx
onReward={async (reward) => {
  await fetch(`http://127.0.0.1:8000/daily-health-game/1/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reward)
  });
}}
```
