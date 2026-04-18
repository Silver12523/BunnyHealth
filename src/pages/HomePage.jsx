import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://127.0.0.1:8000'

const BACKGROUND_MAP = {
  healthy: '/picture/healthhome.png',
  normal: '/picture/normal.png',
  sick: '/picture/sickhome.png',
  dead: '/picture/nighthome.png',
}

const LAYER_IMAGES = {
  fat_mild: '/picture/缺膳食纤维.png',
  fat_severe: '/picture/缺膳食纤维.png',
  iron_mild: '/picture/缺铁.png',
  iron_severe: '/picture/缺铁.png',
  calcium_mild: '/picture/-1.png',
  calcium_severe: '/picture/-1.png',
  iodine_mild: '/picture/缺碘.png',
  iodine_severe: '/picture/缺碘.png',
  vit_c_mild: '/picture/缺维C.png',
  vit_c_severe: '/picture/缺维C.png',
  dead_ghost: '/picture/betterhome.png',
}

export default function HomePage() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('user_id')
  const username = localStorage.getItem('username')

  const [petData, setPetData] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [foodInput, setFoodInput] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!userId) {
      navigate('/login')
      return
    }
    fetchPetData()
    fetchRecommendations()
  }, [userId, navigate])

  const fetchPetData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/pets/${userId}`)
      setPetData(response.data)
    } catch (err) {
      console.error('Failed to fetch pet data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`${API_BASE}/pets/${userId}/recommendations`)
      setRecommendations(response.data)
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
    }
  }

  const handleAnalyzeFood = async (foodName) => {
    setAnalyzing(true)
    try {
      const response = await axios.post(`${API_BASE}/meals/analyze`, {
        user_id: parseInt(userId),
        food_name: foodName,
        image_base64: null
      })
      setAnalysisResult(response.data)
      fetchPetData()
      fetchRecommendations()
    } catch (err) {
      console.error('Failed to analyze food:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSubmitFood = (e) => {
    e.preventDefault()
    if (foodInput.trim()) {
      handleAnalyzeFood(foodInput.trim())
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user_id')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const getBackgroundImage = () => {
    if (!petData?.active_diseases?.length) return BACKGROUND_MAP.healthy
    const hasDead = petData.active_diseases.some(d => d.severity === 'dead')
    if (hasDead) return BACKGROUND_MAP.dead
    const hasSevere = petData.active_diseases.some(d => d.severity === 'severe')
    if (hasSevere) return BACKGROUND_MAP.sick
    return BACKGROUND_MAP.normal
  }

  const getHpBarColor = (value) => {
    if (value >= 80) return 'bg-green-500'
    if (value >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">🐰 加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🐰 欢迎回来，{username}！</h1>
          <p className="text-white/80 text-sm">你的小兔子正在等你</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all"
        >
          退出登录
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">🏠 家园</h2>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900">
              <img
                src={getBackgroundImage()}
                alt="家园背景"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4 animate-float">
                    {petData?.active_diseases?.some(d => d.severity === 'dead')
                      ? '👻'
                      : '🐰'}
                  </div>
                  <p className="text-white text-xl font-bold">
                    {petData?.pet?.name || 'Bunny'}
                  </p>
                  <p className="text-white/80 text-sm">
                    {petData?.pet?.stage === 'baby' ? '幼崽期' : '成年期'}
                  </p>
                </div>
              </div>

              {petData?.active_diseases?.map((disease, index) => (
                <div
                  key={index}
                  className="absolute text-center"
                  style={{
                    top: '20%',
                    left: `${20 + index * 25}%`,
                  }}
                >
                  <img
                    src={LAYER_IMAGES[disease.layer_name]}
                    alt={disease.symptom}
                    className="w-16 h-16 object-contain"
                  />
                  <p className="text-xs text-white bg-black/50 rounded px-2 py-1 mt-1">
                    {disease.element === 'fat' ? '肥胖' :
                     disease.element === 'iron' ? '缺铁' :
                     disease.element === 'calcium' ? '缺钙' :
                     disease.element === 'iodine' ? '缺碘' :
                     disease.element === 'vit_c' ? '缺维C' : ''}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <HPBar label="🍔 肥胖度" value={petData?.pet?.fat_level || 0} inverse />
              <HPBar label="💪 铁 (Fe)" value={petData?.pet?.iron_hp || 0} />
              <HPBar label="🦴 钙 (Ca)" value={petData?.pet?.calcium_hp || 0} />
              <HPBar label="🧂 碘 (I)" value={petData?.pet?.iodine_hp || 0} />
              <HPBar label="🍊 维C" value={petData?.pet?.vit_c_hp || 0} />
            </div>

            {petData?.active_diseases?.length > 0 && (
              <div className="mt-4 p-4 bg-red-500/20 rounded-xl border border-red-500/50">
                <h3 className="text-red-200 font-bold mb-2">⚠️ 当前疾病状态</h3>
                <div className="flex flex-wrap gap-2">
                  {petData.active_diseases.map((disease, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-500/30 rounded-full text-red-200 text-sm"
                    >
                      {disease.symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">📸 上传餐食照片</h2>
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="px-4 py-2 bg-primary/80 hover:bg-primary rounded-xl text-white text-sm transition-all"
              >
                {showUpload ? '收起' : '展开'}
              </button>
            </div>

            {showUpload && (
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-white/30 rounded-2xl p-8 text-center cursor-pointer hover:border-white/50 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="max-h-48 mx-auto rounded-xl"
                    />
                  ) : (
                    <div className="text-white/70">
                      <div className="text-5xl mb-2">📷</div>
                      <p>点击选择图片或拍照</p>
                      <p className="text-sm mt-1">支持 JPG, PNG 格式</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedImage(null)}
                    disabled={!selectedImage}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-xl text-white transition-all"
                  >
                    清除图片
                  </button>
                  <button
                    disabled={!selectedImage || analyzing}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 disabled:opacity-50 rounded-xl text-white font-semibold transition-all"
                  >
                    {analyzing ? '🔄 分析中...' : '✨ AI 分析'}
                  </button>
                </div>

                <p className="text-white/60 text-sm text-center">
                  AI 拍照识别功能即将上线，敬请期待！
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">🍽️ 手动输入食物</h2>
            <form onSubmit={handleSubmitFood} className="flex gap-3">
              <input
                type="text"
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                placeholder="例如：炸鸡、汉堡、蔬菜沙拉..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={analyzing || !foodInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-primary to-pink-400 text-white font-semibold rounded-xl hover:from-pink-400 hover:to-primary disabled:opacity-50 transition-all"
              >
                {analyzing ? '分析中...' : '分析'}
              </button>
            </form>

            {analysisResult && (
              <div className="mt-4 p-4 bg-white/10 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {analysisResult.analysis.is_healthy ? '✅' : '⚠️'}
                  </span>
                  <span className="text-white font-bold">
                    {analysisResult.analysis.food}
                  </span>
                </div>
                <p className="text-white/80 text-sm mb-3">
                  {analysisResult.analysis.reasoning}
                </p>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <NutrientChip label="脂肪" value={analysisResult.analysis.hp_changes.fat} />
                  <NutrientChip label="铁" value={analysisResult.analysis.hp_changes.iron} />
                  <NutrientChip label="钙" value={analysisResult.analysis.hp_changes.calcium} />
                  <NutrientChip label="碘" value={analysisResult.analysis.hp_changes.iodine} />
                  <NutrientChip label="维C" value={analysisResult.analysis.hp_changes.vit_c} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">🍱 食堂推荐</h2>
            {recommendations.reasoning && (
              <p className="text-white/80 text-sm mb-4">{recommendations.reasoning}</p>
            )}
            <div className="space-y-3">
              {recommendations.recommendations?.map((food, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all cursor-pointer"
                  onClick={() => handleAnalyzeFood(food.name)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium">{food.name}</h3>
                      <p className="text-white/60 text-xs mt-1">{food.ingredients}</p>
                    </div>
                    <span className="text-secondary font-bold text-sm">¥{food.price}</span>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {food.iron_score > 5 && <Badge color="red">铁+{food.iron_score}</Badge>}
                    {food.calcium_score > 5 && <Badge color="blue">钙+{food.calcium_score}</Badge>}
                    {food.iodine_score > 5 && <Badge color="purple">碘+{food.iodine_score}</Badge>}
                    {food.vit_c_score > 5 && <Badge color="orange">维C+{food.vit_c_score}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">📊 营养建议</h2>
            <div className="space-y-3 text-white/80 text-sm">
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="font-bold text-white mb-1">💡 每日小贴士</p>
                <p>保持饮食均衡，多吃蔬菜水果，少吃垃圾食品！</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="font-bold text-white mb-1">🎯 今日目标</p>
                <p>摄入足够的蛋白质和维生素，让小兔子健康成长！</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HPBar({ label, value, inverse = false }) {
  const getColor = () => {
    if (inverse) {
      if (value >= 80) return 'bg-red-500'
      if (value >= 50) return 'bg-yellow-500'
      return 'bg-green-500'
    }
    if (value >= 80) return 'bg-green-500'
    if (value >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-white/10 rounded-xl p-3">
      <div className="flex justify-between text-white/80 text-xs mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function NutrientChip({ label, value }) {
  const isPositive = value > 0
  const isNegative = value < 0

  return (
    <div
      className={`p-2 rounded-lg text-center ${
        isPositive ? 'bg-green-500/30 text-green-200' :
        isNegative ? 'bg-red-500/30 text-red-200' :
        'bg-white/10 text-white/60'
      }`}
    >
      <div className="text-xs">{label}</div>
      <div className="font-bold text-sm">
        {isPositive ? '+' : ''}{value}
      </div>
    </div>
  )
}

function Badge({ color, children }) {
  const colors = {
    red: 'bg-red-500/30 text-red-200',
    blue: 'bg-blue-500/30 text-blue-200',
    purple: 'bg-purple-500/30 text-purple-200',
    orange: 'bg-orange-500/30 text-orange-200',
  }

  return (
    <span className={`px-2 py-0.5 rounded text-xs ${colors[color]}`}>
      {children}
    </span>
  )
}
