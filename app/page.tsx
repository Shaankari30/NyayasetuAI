'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Scale, MessageSquare, FileText, Send, Upload,
  Loader2, AlertTriangle, CheckCircle, Globe, ChevronDown
} from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'mr', label: 'मराठी' },
]

const SAMPLE_QUESTIONS = [
  'My landlord is refusing to return my security deposit. What are my rights?',
  'My employer has not paid salary for 2 months. What can I do?',
  'What are my rights as a consumer if I receive a defective product?',
  'Can my landlord evict me without notice?',
]

type Message = { role: 'user' | 'assistant'; content: string }
type RiskItem = { level: 'high' | 'medium' | 'low'; clause: string; explanation: string }
type AnalysisResult = { summary: string; risks: RiskItem[]; recommendations: string[] }

export default function Home() {
  const [tab, setTab] = useState<'chat' | 'analyze'>('chat')
  const [lang, setLang] = useState(LANGUAGES[0])
  const [langOpen, setLangOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Namaste! I am NyayaSetu AI, your legal assistant. I can help you understand your rights under Indian law — in your language. Ask me anything about tenant rights, labor laws, consumer protection, or family law.",
    },
  ])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text?: string) {
    const query = text || input.trim()
    if (!query || chatLoading) return
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: query }]
    setMessages(newMessages)
    setChatLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, language: lang.label }),
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  async function analyzeContract() {
    if (!file) return
    setAnalyzeLoading(true)
    setAnalysis(null)
    setAnalyzeError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('language', lang.label)
      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAnalysis(data)
    } catch (e: unknown) {
      setAnalyzeError(e instanceof Error ? e.message : 'Analysis failed. Please try again.')
    } finally {
      setAnalyzeLoading(false)
    }
  }

  const riskColor = (level: string) =>
    level === 'high' ? 'border-red-500 bg-red-500/10' :
    level === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
    'border-green-500 bg-green-500/10'

  const riskBadge = (level: string) =>
    level === 'high' ? 'bg-red-500 text-white' :
    level === 'medium' ? 'bg-yellow-500 text-black' :
    'bg-green-500 text-white'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0f1d3a 0%, #1a2e5a 100%)' }}>
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF9933, #138808)' }}>
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">NyayaSetu AI</h1>
            <p className="text-xs text-white/50">Democratizing Legal Access for Every Indian</p>
          </div>
        </div>
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition text-sm text-white"
          >
            <Globe className="w-4 h-4 text-[#FF9933]" />
            {lang.label}
            <ChevronDown className="w-3 h-3 text-white/50" />
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-1 w-36 rounded-xl border border-white/20 bg-[#1a2e5a] shadow-2xl z-50 overflow-hidden">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l); setLangOpen(false) }}
                  className={`w-full text-left px-4 py-2 text-sm transition hover:bg-white/10 ${lang.code === l.code ? 'text-[#FF9933] font-semibold' : 'text-white/80'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/10 px-6">
        {[
          { id: 'chat', icon: MessageSquare, label: 'Legal Assistant' },
          { id: 'analyze', icon: FileText, label: 'Contract Analyzer' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as 'chat' | 'analyze')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition mr-2 ${
              tab === t.id
                ? 'border-[#FF9933] text-[#FF9933]'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── CHAT TAB ── */}
        {tab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-2 mt-1" style={{ background: 'linear-gradient(135deg, #FF9933, #138808)' }}>
                      <Scale className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#FF9933] text-white rounded-tr-sm'
                        : 'bg-white/10 text-white/90 border border-white/10 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-2" style={{ background: 'linear-gradient(135deg, #FF9933, #138808)' }}>
                    <Scale className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF9933]" />
                    <span className="text-sm text-white/50">Consulting legal sources…</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Sample questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-white/40 mb-2 px-1">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2">
              <div className="flex gap-2 items-end bg-white/5 border border-white/20 rounded-2xl px-4 py-3">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder={`Ask your legal question in ${lang.label}…`}
                  rows={1}
                  className="flex-1 bg-transparent text-white placeholder-white/30 text-sm resize-none outline-none"
                  style={{ maxHeight: 120 }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || chatLoading}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg, #FF9933, #e6821a)' }}
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-center text-xs text-white/20 mt-2">
                NyayaSetu AI provides general legal information, not professional legal advice.
              </p>
            </div>
          </div>
        )}

        {/* ── ANALYZE TAB ── */}
        {tab === 'analyze' && (
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Upload box */}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center cursor-pointer hover:border-[#FF9933]/60 hover:bg-white/5 transition group"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={e => { setFile(e.target.files?.[0] || null); setAnalysis(null); setAnalyzeError('') }}
                />
                <Upload className="w-10 h-10 mx-auto mb-3 text-white/30 group-hover:text-[#FF9933] transition" />
                {file ? (
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-white/40 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB — click to change</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-white/70 font-medium">Upload a contract or agreement</p>
                    <p className="text-white/30 text-sm mt-1">PDF or TXT • Rental, Employment, Consumer notices</p>
                  </div>
                )}
              </div>

              {file && !analysis && (
                <button
                  onClick={analyzeContract}
                  disabled={analyzeLoading}
                  className="w-full py-3 rounded-xl font-semibold text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #FF9933, #138808)' }}
                >
                  {analyzeLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing document…</> : <><FileText className="w-4 h-4" /> Analyze Contract</>}
                </button>
              )}

              {analyzeError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
                  {analyzeError}
                </div>
              )}

              {analysis && (
                <div className="space-y-5">
                  {/* Summary */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#138808]" /> Document Summary
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">{analysis.summary}</p>
                  </div>

                  {/* Risks */}
                  {analysis.risks?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#FF9933]" /> Risk Analysis
                      </h3>
                      <div className="space-y-3">
                        {analysis.risks.map((r, i) => (
                          <div key={i} className={`border rounded-xl p-4 ${riskColor(r.level)}`}>
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-white text-sm font-medium">{r.clause}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 uppercase ${riskBadge(r.level)}`}>
                                {r.level}
                              </span>
                            </div>
                            <p className="text-white/60 text-xs mt-2 leading-relaxed">{r.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations?.length > 0 && (
                    <div className="bg-[#138808]/10 border border-[#138808]/30 rounded-2xl p-5">
                      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <Scale className="w-4 h-4 text-[#138808]" /> Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i} className="flex gap-2 text-sm text-white/70">
                            <span className="text-[#FF9933] font-bold flex-shrink-0">{i + 1}.</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => { setFile(null); setAnalysis(null) }}
                    className="w-full py-2 rounded-xl text-sm text-white/50 border border-white/10 hover:bg-white/5 transition"
                  >
                    Analyze another document
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
