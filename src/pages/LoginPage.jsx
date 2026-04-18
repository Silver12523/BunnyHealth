import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://127.0.0.1:8000'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [targetCalories, setTargetCalories] = useState(2000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_BASE}/users/`, {
        username,
        target_calories: parseFloat(targetCalories)
      })

      if (response.data.user_id) {
        localStorage.setItem('user_id', response.data.user_id)
        localStorage.setItem('username', username)
        navigate('/home')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('登录失败，请检查后端服务是否启动')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    localStorage.setItem('user_id', '1')
    localStorage.setItem('username', 'Demo User')
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">🐰</div>
          <h1 className="text-4xl font-bold text-white mb-2">BunnyHealth</h1>
          <p className="text-white/80 text-sm">健康饮食与电子宠物养成系统</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              🐰 宠物主人名字
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="给主人取个名字吧~"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              🍽️ 每日目标热量 (kcal)
            </label>
            <input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(e.target.value)}
              min="1000"
              max="5000"
              step="100"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-pink-400 text-white font-semibold rounded-xl hover:from-pink-400 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? '🐰 创建中...' : '🚀 开始冒险'}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={handleDemoLogin}
            className="w-full py-3 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            🧪 演示模式（使用已有用户）
          </button>
        </div>

        <p className="text-center text-white/60 text-xs mt-6">
          温馨提示：请确保后端服务已启动 (127.0.0.1:8000)
        </p>
      </div>
    </div>
  )
}
