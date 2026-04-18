import { useRef, useState } from 'react'
import axios from 'axios'
import bunnyHome from '../../picture/normal.png'

const API_BASE = '/api'
const DEFAULT_USER_ID = 1

export default function HomePage() {
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [imageBase64, setImageBase64] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

  const currentUserId = Number(localStorage.getItem('user_id')) || DEFAULT_USER_ID

  const handleChoosePhoto = () => {
    setNotice('')
    fileInputRef.current?.click()
  }

  const analyzeMeal = async (base64Value) => {
    if (!base64Value) {
      setErrorMessage('先拍照或上传这一顿饭的照片。')
      return
    }

    setIsAnalyzing(true)
    setErrorMessage('')
    setNotice('')

    try {
      const response = await axios.post(`${API_BASE}/meals/analyze`, {
        user_id: currentUserId,
        food_name: '图片识别餐食',
        image_base64: base64Value,
      })

      setAnalysisResult(response.data)
    } catch (error) {
      console.error('Failed to analyze meal:', error)
      setErrorMessage('识别失败，请确认后端服务已经启动。')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('请上传一张餐食照片。')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result)
      const base64Value = result.split(',')[1] || result
      setSelectedFile(file)
      setPreviewUrl(result)
      setImageBase64(base64Value)
      setAnalysisResult(null)
      setErrorMessage('')
      analyzeMeal(base64Value)
    }
    reader.onerror = () => {
      setErrorMessage('照片读取失败，请重新选择。')
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyzeMeal = async () => {
    analyzeMeal(imageBase64)
  }

  const handleClearPhoto = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setImageBase64('')
    setAnalysisResult(null)
    setErrorMessage('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const showComingSoon = (label) => {
    setNotice(`${label} 还没有接入，先完成拍照识别这一屏。`)
  }

  return (
    <main className="min-h-screen bg-[#f7faf7] text-[#18221d]">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-4 pt-5">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#29705a]">BunnyHealth</p>
            <h1 className="mt-1 text-2xl font-bold">拍下这一餐</h1>
          </div>
          <img
            src={bunnyHome}
            alt="小兔子家园"
            className="h-14 w-14 rounded-lg object-cover"
          />
        </header>

        <div className="flex-1">
          <button
            type="button"
            onClick={handleChoosePhoto}
            className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[#8bc5af] bg-white text-left shadow-sm transition hover:border-[#29705a] focus:outline-none focus:ring-2 focus:ring-[#29705a] focus:ring-offset-2"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="已上传的餐食照片"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-8">
                <img
                  src={bunnyHome}
                  alt="等待拍照的小兔子"
                  className="h-32 w-32 rounded-lg object-cover"
                />
                <div className="text-center">
                  <p className="text-lg font-bold">点击拍照或上传</p>
                  <p className="mt-2 text-sm leading-6 text-[#61726a]">
                    上传这一顿饭的照片后，我会把图片发给后端识别。
                  </p>
                </div>
              </div>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />

          {selectedFile && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm text-[#61726a] shadow-sm">
              <span className="truncate pr-3">{selectedFile.name}</span>
              <button
                type="button"
                onClick={handleClearPhoto}
                className="shrink-0 rounded-lg px-3 py-1 font-semibold text-[#d6534f] transition hover:bg-[#ffe8e6]"
              >
                重拍
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleAnalyzeMeal}
            disabled={!previewUrl || isAnalyzing}
            className="mt-4 w-full rounded-lg bg-[#29705a] px-5 py-4 text-base font-bold text-white shadow-sm transition hover:bg-[#1f5b49] disabled:cursor-not-allowed disabled:bg-[#a9b8b1]"
          >
            {!previewUrl
              ? '上传照片后自动识别'
              : isAnalyzing
                ? '正在识别...'
                : '重新识别这张照片'}
          </button>

          {errorMessage && (
            <p className="mt-3 rounded-lg border border-[#f3aaa6] bg-[#fff0ef] px-3 py-2 text-sm text-[#a83430]">
              {errorMessage}
            </p>
          )}

          {analysisResult && (
            <MealResult result={analysisResult} />
          )}

          {notice && (
            <p className="mt-3 rounded-lg bg-[#e8f4ef] px-3 py-2 text-sm text-[#29705a]">
              {notice}
            </p>
          )}
        </div>

        <nav className="mt-5 grid grid-cols-3 gap-2">
          <button
            type="button"
            className="rounded-lg bg-[#ffcf5a] px-2 py-3 text-sm font-bold text-[#332400] shadow-sm"
          >
            你想吃什么？
          </button>
          <button
            type="button"
            onClick={() => showComingSoon('宠物状态')}
            className="rounded-lg bg-white px-2 py-3 text-sm font-bold text-[#40514a] shadow-sm transition hover:bg-[#edf5f1]"
          >
            宠物状态？
          </button>
          <button
            type="button"
            onClick={() => showComingSoon('健康任务')}
            className="rounded-lg bg-white px-2 py-3 text-sm font-bold text-[#40514a] shadow-sm transition hover:bg-[#edf5f1]"
          >
            健康任务
          </button>
        </nav>
      </section>
    </main>
  )
}

function MealResult({ result }) {
  const analysis = result.analysis
  const hp = result.pet_current_state?.hp || {}

  return (
    <section className="mt-4 rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#29705a]">识别结果</p>
          <h2 className="mt-1 text-xl font-bold">{analysis.food}</h2>
        </div>
        <span className={`rounded-lg px-3 py-1 text-sm font-bold ${
          analysis.is_healthy
            ? 'bg-[#e3f6e9] text-[#27723d]'
            : 'bg-[#fff0ef] text-[#a83430]'
        }`}
        >
          {analysis.is_healthy ? '健康' : '需注意'}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#61726a]">
        {analysis.reasoning}
      </p>

      <div className="mt-4 grid grid-cols-5 gap-2">
        <Nutrient label="脂肪" value={hp.fat} />
        <Nutrient label="铁" value={hp.iron} />
        <Nutrient label="钙" value={hp.calcium} />
        <Nutrient label="碘" value={hp.iodine} />
        <Nutrient label="维C" value={hp.vit_c} />
      </div>
    </section>
  )
}

function Nutrient({ label, value = 0 }) {
  return (
    <div className="rounded-lg bg-[#f1f6f3] px-2 py-3 text-center">
      <p className="text-xs font-semibold text-[#61726a]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#18221d]">{value}</p>
    </div>
  )
}
