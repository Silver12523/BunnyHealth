export default function HealthGameEntryButton({ onEnter, disabled = false }) {
  return (
    <button
      type="button"
      className="health-game-entry-button"
      onClick={onEnter}
      disabled={disabled}
    >
      每日健康小游戏
    </button>
  );
}
