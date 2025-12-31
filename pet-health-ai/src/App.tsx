import { useState, useCallback, useRef, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './lib/AuthContext'
import { 
  Upload, 
  Scan, 
  Heart, 
  Shield, 
  Zap, 
  Database, 
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Activity,
  Stethoscope,
  PawPrint,
  History,
  X,
  Clock,
  RefreshCw,
  WifiOff,
  FileWarning,
  ServerCrash,
  LogIn,
  LogOut,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ExternalLink,
  Phone,
  MapPin
} from 'lucide-react'

interface Disease {
  name: string
  probability: number
  severity: string
}

interface Recommendation {
  title: string
  description: string
  priority: string
}

interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  purpose: string
}

interface DiagnosisResult {
  id: string
  healthScore: number
  riskLevel: string
  diagnosis: string
  description: string
  diseases: Disease[]
  recommendations: Recommendation[]
  medications: Medication[]
}

interface HistoryRecord {
  id: string
  image_url: string
  symptoms: string
  health_score: number
  risk_level: string
  diagnosis: string
  description: string
  diseases: Disease[]
  recommendations: Recommendation[]
  medications: Medication[]
  created_at: string
}

type AnalysisState = 'idle' | 'preview' | 'analyzing' | 'complete'

interface ErrorInfo {
  type: 'upload' | 'network' | 'server' | 'timeout' | 'validation' | 'unknown'
  message: string
  suggestion: string
}

interface Review {
  id: string
  user_name: string
  pet_type: string
  pet_name: string
  content: string
  rating: number
  avatar_url: string
}

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const [state, setState] = useState<AnalysisState>('idle')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading2, setAuthLoading2] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ petType: '', petName: '', content: '', rating: 5 })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [showDashboard, setShowDashboard] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')
  const [userPoints, setUserPoints] = useState(1250)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check for admin access via URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('admin') === 'true') {
      setCurrentPage('admin')
    }
  }, [])

  // Load reviews on mount
  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    // Use static demo data with English names and evaluations
    const staticReviews: Review[] = [
      {
        id: '1',
        user_name: 'Sarah Johnson',
        pet_type: 'Golden Retriever',
        pet_name: 'Max',
        content: 'HealIPet has been absolutely incredible for my Golden Retriever Max! The AI analysis caught an early skin condition that my vet confirmed was developing. The detailed health assessment and care recommendations were spot-on. What impressed me most was how quickly the analysis was completed - just 3 seconds! The user interface is intuitive and the results are presented in a way that even a first-time pet owner can understand.',
        rating: 5,
        avatar_url: '/imgs/pet_avatar_1_8.png'
      },
      {
        id: '2', 
        user_name: 'Michael Thompson',
        pet_type: 'Maine Coon',
        pet_name: 'Luna',
        content: 'As a busy professional, I was looking for a convenient way to monitor my cat Luna\'s health between vet visits. HealIPet has exceeded my expectations! The AI system accurately detected subtle changes in Luna\'s posture and behavior that indicated she was feeling under the weather. The app provided specific recommendations for nutrition and care that made a real difference. The comprehensive health score gave me peace of mind knowing exactly where Luna stands.',
        rating: 5,
        avatar_url: '/imgs/pet_avatar_1_2.png'
      },
      {
        id: '3',
        user_name: 'Emily Rodriguez',
        pet_type: 'Border Collie',
        pet_name: 'Charlie',
        content: 'This AI-powered pet health platform has revolutionized how I care for my energetic Border Collie, Charlie. The image analysis is incredibly sophisticated - it can detect issues with eyes, skin, and even behavioral patterns that might indicate health concerns. The educational aspect is fantastic too, helping me understand Charlie\'s needs better. The 24/7 accessibility means I can check on his health anytime, anywhere. I\'ve already recommended HealIPet to all my fellow dog owners!',
        rating: 5,
        avatar_url: '/imgs/pet_avatar_2_0.jpg'
      }
    ]
    setReviews(staticReviews)
  }

  const submitReview = async () => {
    if (!user || !reviewForm.content.trim()) return
    setSubmittingReview(true)
    try {
      await supabase.from('pet_reviews').insert({
        user_id: user.id,
        user_name: user.email?.split('@')[0] || 'Anonymous User',
        pet_type: reviewForm.petType || 'Pet',
        pet_name: reviewForm.petName || 'Buddy',
        content: reviewForm.content,
        rating: reviewForm.rating,
        avatar_url: '/imgs/pet_avatar_1_8.png'
      })
      setShowReviewModal(false)
      setReviewForm({ petType: '', petName: '', content: '', rating: 5 })
      alert('Review submitted successfully. It will be displayed after review.')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingReview(false)
    }
  }

  // Load history when user changes
  useEffect(() => {
    if (user) {
      loadHistory()
    } else {
      setHistory([])
    }
  }, [user])

  const loadHistory = async () => {
    if (!user) return
    
    setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from('pet_diagnoses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setHistory(data || [])
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading2(true)

    try {
      if (authMode === 'login') {
        const { error } = await signIn(authEmail, authPassword)
        if (error) throw error
        setShowAuthModal(false)
        setAuthEmail('')
        setAuthPassword('')
        // Auto redirect to Dashboard after successful login
        setShowDashboard(true)
      } else {
        const { error, needsConfirmation } = await signUp(authEmail, authPassword)
        if (error) throw error
        setShowAuthModal(false)
        setAuthEmail('')
        setAuthPassword('')
        setShowWelcomeModal(true)
      }
    } catch (err: any) {
      const msg = err.message || 'Operation failed'
      if (msg.includes('Invalid login')) {
        setAuthError('Invalid email or password')
      } else if (msg.includes('already registered')) {
        setAuthError('This email is already registered')
      } else if (msg.includes('Password')) {
        setAuthError('Password must be at least 6 characters')
      } else {
        setAuthError(msg)
      }
    } finally {
      setAuthLoading2(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setHistory([])
  }

  const parseError = (err: any): ErrorInfo => {
    const message = err?.message || err?.toString() || 'Unknown error'
    
    if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
      return { type: 'network', message: 'Network connection failed', suggestion: 'Please check your network connection and try again' }
    }
    if (message.includes('timeout') || message.includes('Timeout')) {
      return { type: 'timeout', message: 'Request timeout', suggestion: 'Server response is slow, please try again later' }
    }
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('server')) {
      return { type: 'server', message: 'Server temporarily unavailable', suggestion: 'Server is under maintenance, please try again later' }
    }
    if (message.includes('upload') || message.includes('storage') || message.includes('size')) {
      return { type: 'upload', message: 'Image upload failed', suggestion: 'Please ensure image is under 10MB, JPG or PNG format' }
    }
    if (message.includes('invalid') || message.includes('required')) {
      return { type: 'validation', message: 'Data validation failed', suggestion: 'Please check if the uploaded image format is correct' }
    }
    return { type: 'unknown', message: message, suggestion: 'Please try again. If the issue persists, contact customer service' }
  }

  const getErrorIcon = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'network': return <WifiOff className="w-5 h-5" />
      case 'upload': return <FileWarning className="w-5 h-5" />
      case 'server': return <ServerCrash className="w-5 h-5" />
      case 'timeout': return <Clock className="w-5 h-5" />
      default: return <AlertTriangle className="w-5 h-5" />
    }
  }

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorInfo({ type: 'validation', message: 'Unsupported file format', suggestion: 'Please upload JPG, PNG or WEBP format images' })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorInfo({ type: 'upload', message: 'Image file too large', suggestion: 'Please upload an image smaller than 10MB' })
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
      setState('preview')
      setErrorInfo(null)
    }
    reader.onerror = () => {
      setErrorInfo({ type: 'upload', message: 'Image read failed', suggestion: 'Please try selecting a different image' })
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleAnalyze = async (retry = false) => {
    if (!imagePreview) return
    
    setState('analyzing')
    setErrorInfo(null)
    if (!retry) setRetryCount(0)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-pet-health', {
        body: {
          imageData: imagePreview,
          fileName: `pet-${Date.now()}.jpg`,
          symptoms,
          userId: user?.id || null
        }
      })

      clearTimeout(timeoutId)

      if (fnError) throw fnError

      if (data?.data?.diagnosis) {
        setDiagnosis(data.data.diagnosis)
        setState('complete')
        if (user) loadHistory()
      } else if (data?.error) {
        throw new Error(data.error.message || 'Analysis failed')
      } else {
        throw new Error('Invalid analysis result')
      }
    } catch (err: any) {
      clearTimeout(timeoutId)
      
      if (err.name === 'AbortError') {
        setErrorInfo({ type: 'timeout', message: 'Analysis request timeout', suggestion: 'Server processing time is long, please try again' })
      } else {
        setErrorInfo(parseError(err))
      }
      setState('preview')
      setRetryCount(prev => prev + 1)
    }
  }

  const handleRetry = () => {
    if (retryCount < 3) {
      handleAnalyze(true)
    }
  }

  const handleReset = () => {
    setState('idle')
    setImagePreview(null)
    setSymptoms('')
    setDiagnosis(null)
    setErrorInfo(null)
    setRetryCount(0)
  }

  const viewHistoryRecord = (record: HistoryRecord) => {
    setImagePreview(record.image_url)
    setSymptoms(record.symptoms)
    setDiagnosis({
      id: record.id,
      healthScore: record.health_score,
      riskLevel: record.risk_level,
      diagnosis: record.diagnosis || 'Diagnosis Result',
      description: record.description || 'No detailed description available',
      diseases: record.diseases || [],
      recommendations: record.recommendations || [],
      medications: record.medications || []
    })
    setState('complete')
    setShowHistory(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00CC99'
    if (score >= 60) return '#F59E0B'
    return '#EF4444'
  }

  const getRiskBadgeClass = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'high': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRiskText = (level: string) => {
    switch (level) {
      case 'low': return 'Low Risk'
      case 'medium': return 'Medium Risk'
      case 'high': return 'High Risk'
      default: return 'Unknown'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F6F8]">
        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  // Dashboard page
  if (showDashboard && user) {
    return <Dashboard user={user} onBack={() => setShowDashboard(false)} userPoints={userPoints} setUserPoints={setUserPoints} onNavigate={setCurrentPage} />
  }

  // Legal and info pages
  if (currentPage === 'privacy') {
    return <PrivacyPolicy onBack={() => setCurrentPage('home')} />
  }
  
  if (currentPage === 'terms') {
    return <TermsOfService onBack={() => setCurrentPage('home')} />
  }
  
  if (currentPage === 'contact') {
    return <ContactUs onBack={() => setCurrentPage('home')} />
  }
  
  if (currentPage === 'about') {
    return <AboutUs onBack={() => setCurrentPage('home')} />
  }
  
  if (currentPage === 'admin') {
    return <AdminPanel onBack={() => setCurrentPage('home')} />
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-400/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">HealIPet</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Legal and Info Links */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <button 
                onClick={() => setCurrentPage('about')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => setCurrentPage('contact')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </button>
              <button 
                onClick={() => setCurrentPage('privacy')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy
              </button>
              <button 
                onClick={() => setCurrentPage('terms')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms
              </button>
            </div>
            
            {user ? (
              <>
                <button 
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <History className="w-5 h-5" />
                  <span className="hidden md:inline">My Records</span>
                </button>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                className="flex items-center gap-2 btn-secondary text-sm py-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 pt-16 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left relative">
              {/* Floating orbs around text */}
              <div className="floating-orb orb-1 w-32 h-32 absolute -top-8 -left-8 opacity-30" />
              <div className="floating-orb orb-2 w-20 h-20 absolute top-1/2 -right-4 opacity-20" />
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                <span className="text-blue-600">Your personal</span>
                <br />
                <span className="text-gray-900">AI veterinarian</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                snap a pet photo to get instant diagnosis
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-green">10,000+</div>
                  <div className="text-gray-600 text-sm">Pet Owners</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-green">50+</div>
                  <div className="text-gray-600 text-sm">Health Conditions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-green">95%</div>
                  <div className="text-gray-600 text-sm">Accuracy Rate</div>
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                {!user ? (
                  <button 
                    onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                    className="btn-primary btn-glow text-lg px-12 py-6 inline-flex items-center gap-3"
                  >
                    <PawPrint className="w-6 h-6" />
                    Start AI Diagnosis
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowDashboard(true)}
                    className="btn-primary btn-glow text-lg px-12 py-6 inline-flex items-center gap-3"
                  >
                    <Scan className="w-6 h-6" />
                    Start Diagnosis
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Right Content - Pet Gallery */}
            <div className="relative opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <div className="relative">
                {/* Central main image */}
                <div className="relative z-10 mx-auto w-80 h-80 rounded-3xl overflow-hidden shadow-2xl">
                  <img src="./imgs/fluffy-tabby-kitten-pink-collar-portrait.jpg" alt="Pet Health AI" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent" />
                </div>
                
                {/* Floating smaller images */}
                <img 
                  src="./imgs/happy-golden-retriever-laughing-deck.jpg" 
                  alt="" 
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-2xl object-cover shadow-lg border-4 border-white/20 animate-pulse-ring" 
                />
                <img 
                  src="./imgs/golden-retriever-puppy-sitting-red-collar.jpg" 
                  alt="" 
                  className="absolute -bottom-6 -left-6 w-20 h-20 rounded-xl object-cover shadow-lg border-4 border-white/20 animate-pulse-ring" 
                  style={{ animationDelay: '1s' }}
                />
                <img 
                  src="./imgs/golden-retriever-cuddling-grey-cat-friends.jpg" 
                  alt="" 
                  className="absolute top-1/2 -right-12 w-16 h-16 rounded-lg object-cover shadow-lg border-4 border-white/20 animate-pulse-ring" 
                  style={{ animationDelay: '2s' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnosis Card - Login Required */}
      <section id="diagnose" className="relative z-10 px-4 pb-16">
        <div className="max-w-2xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          <div className="upload-card-light">
            
            <div className="space-y-6">
              {/* Logo/Icon */}
              <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <PawPrint className="w-12 h-12 text-white" />
              </div>
              
              <h3>Upload pet photo</h3>
              <p>
                Get instant AI health analysis for your pet
              </p>
              
              {/* Upload Area */}
              <div 
                className={`upload-area ${dragActive ? 'border-blue-400 bg-blue-50' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => user ? fileInputRef.current?.click() : setShowAuthModal(true)}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div className="upload-text">Click or drag to upload photo</div>
                <div className="upload-info">Supports JPG, PNG formats, maximum 10MB</div>
                {!user && (
                  <div className="upload-warning">Login required to start diagnosis</div>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="stat-card">
                  <div className="text-primary text-2xl font-bold mb-1">⚡ 3-5s</div>
                  <div className="text-secondary">Quick Analysis</div>
                </div>
                <div className="stat-card">
                  <div className="text-primary text-2xl font-bold mb-1">📊 Professional</div>
                  <div className="text-secondary">Health Score</div>
                </div>
              </div>
              
              {!user ? (
                <div className="space-y-3">
                  <button 
                    onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
                  >
                    <LogIn className="w-6 h-6" />
                    Login to Start Diagnosis
                  </button>
                  
                  <button 
                    onClick={() => { setShowAuthModal(true); setAuthMode('signup'); }}
                    className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    Don't have an account? Sign up
                  </button>
                </div>
              ) : (
                /* User Logged In - Show Upload Interface */
                <div className="space-y-3">
                  <button 
                    onClick={() => handleAnalyze()}
                    disabled={!imagePreview || state === 'analyzing'}
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state === 'analyzing' ? (
                      <>
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Scan className="w-6 h-6" />
                        Start AI Diagnosis
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setShowHistory(true)}
                    className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
                  >
                    <History className="w-5 h-5" />
                    View History
                  </button>
                </div>
              )}
              
              <div className="trust-badges">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>Privacy Protected</span>
                </div>
                <div className="flex items-center gap-1">
                  <Database className="w-4 h-4" />
                  <span>Secure Data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Upload Interface (when logged in) */}
      {user && state !== 'idle' && (
        <section className="relative z-10 px-4 pb-16">
          <div className="max-w-2xl mx-auto">
            <div className="auth-card rounded-3xl p-6 md:p-8">
              {/* Preview State */}
              {state === 'preview' && imagePreview && (
                <div className="space-y-6">
                  <div className="relative rounded-2xl overflow-hidden">
                    <img src={imagePreview} alt="Pet preview" className="w-full h-64 object-cover" />
                    <button 
                      onClick={handleReset}
                      className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-full text-sm transition-colors"
                    >
                      Reselect
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Describe pet symptoms (recommended for more accurate analysis)
                    </label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="For example: Dog has lost appetite recently, seems lethargic, occasionally coughs..."
                      className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary-400/50 resize-none"
                      rows={3}
                    />
                  </div>

                  {errorInfo && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-red-400 mt-0.5">{getErrorIcon(errorInfo.type)}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-red-300">{errorInfo.message}</h4>
                          <p className="text-sm text-red-400/80 mt-1">{errorInfo.suggestion}</p>
                          {retryCount < 3 && (
                            <button onClick={handleRetry} className="mt-2 flex items-center gap-1.5 text-sm text-red-300 hover:text-red-200 font-medium">
                              <RefreshCw className="w-4 h-4" />
                              Retry ({3 - retryCount} attempts left)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <button onClick={() => handleAnalyze()} className="w-full btn-primary flex items-center justify-center gap-2">
                    <Scan className="w-5 h-5" />
                    Start AI Analysis
                  </button>
                </div>
              )}

              {/* Analyzing State */}
              {state === 'analyzing' && imagePreview && (
                <div className="space-y-6">
                  <div className="relative rounded-2xl overflow-hidden">
                    <img src={imagePreview} alt="Pet analyzing" className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center">
                        <div className="scan-effect" />
                        <Scan className="w-12 h-12 text-secondary-400 mx-auto mb-3 animate-pulse" />
                        <p className="text-white font-medium">AI is analyzing features...</p>
                        <p className="text-white/60 text-sm mt-1">Expected 3-5 seconds</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Complete State - Results */}
              {state === 'complete' && diagnosis && imagePreview && (
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <img src={imagePreview} alt="Pet" className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-secondary-400" />
                        <span className="text-secondary-400 font-medium">Analysis Complete</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeClass(diagnosis.riskLevel)}`}>
                        {getRiskText(diagnosis.riskLevel)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center py-4">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="45" fill="none"
                          stroke={getScoreColor(diagnosis.healthScore)}
                          strokeWidth="8" strokeLinecap="round" strokeDasharray="283"
                          strokeDashoffset={283 - (283 * diagnosis.healthScore) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold" style={{ color: getScoreColor(diagnosis.healthScore) }}>{diagnosis.healthScore}</span>
                        <span className="text-sm text-white/60">Health Score</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />Risk Assessment
                    </h4>
                    <div className="space-y-2">
                      {diagnosis.diseases.map((disease, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                          <span className="text-white">{disease.name}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${disease.probability}%`, backgroundColor: disease.severity === 'high' ? '#EF4444' : disease.severity === 'medium' ? '#F59E0B' : '#00CC99' }} />
                            </div>
                            <span className="text-sm text-white/70 w-10">{disease.probability}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4" />Health Recommendations
                    </h4>
                    <div className="space-y-3">
                      {diagnosis.recommendations.map((rec, index) => (
                        <div key={index} className="bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${rec.priority === 'high' ? 'bg-red-500/20' : rec.priority === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
                              <ChevronRight className={`w-4 h-4 ${rec.priority === 'high' ? 'text-red-400' : rec.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'}`} />
                            </div>
                            <div>
                              <h5 className="font-medium text-white">{rec.title}</h5>
                              <p className="text-sm text-white/70 mt-1">{rec.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={handleReset} className="flex-1 btn-secondary">Re-diagnose</button>
                  </div>

                  <p className="text-xs text-white/50 text-center">This result is for reference only and does not replace professional veterinary diagnosis. Please seek medical attention for severe symptoms.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Features Section */}
      <section id="features" className="relative z-10 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              Why Choose <span className="gradient-text">HealIPet</span>
            </h2>
            <p className="text-xl text-gray-700 opacity-0 animate-fade-in-up max-w-4xl mx-auto" style={{ animationDelay: '950ms' }}>
              HealIPet uses advanced AI technology, combined with a professional veterinary knowledge base, to provide your beloved pet with comprehensive, all-weather health monitoring services. Our AI system can quickly analyze pets' eyes, skin, fur, posture, and behavior, detect potential health problems early, and provide professional medical advice and care guidance. Anytime, anywhere, just one photo can get a professional-level health assessment, allowing your pet to enjoy the highest quality medical care.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon={<Zap className="w-8 h-8" />} title="⚡ Lightning Fast" description="AI real-time processing, get professional analysis reports in 3-5 seconds" delay={0} />
            <FeatureCard icon={<Database className="w-8 h-8" />} title="📊 Professional Database" description="Intelligent recognition system covering 50+ common pet diseases" delay={150} />
            <FeatureCard icon={<Shield className="w-8 h-8" />} title="🔒 Privacy Protection" description="All data encrypted processing, medical-grade security guarantee" delay={300} />
          </div>
          
          {/* Additional stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text-green mb-2">98%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text-green mb-2">24/7</div>
              <div className="text-gray-600">All-Day Service</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text-green mb-2">100K+</div>
              <div className="text-gray-600">Diagnoses Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text-green mb-2">99.9%</div>
              <div className="text-gray-600">System Reliability</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Detection Example Section */}
      <section className="relative z-10 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              AI <span className="gradient-text">Detection Example</span>
            </h2>
            <p className="text-xl text-gray-700">See how HealIPet analyzes pet health conditions with detailed feedback</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Pet Image */}
            <div className="relative opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="relative mx-auto w-80 h-80 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="./imgs/fluffy-tabby-kitten-pink-collar-portrait.jpg" 
                  alt="Milo - British Shorthair Cat" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent" />
                
                {/* Pet Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="glass-panel-light rounded-2xl p-4">
                    <h4 className="font-bold text-gray-900">Milo</h4>
                    <p className="text-sm text-gray-600">British Shorthair • 3 years old</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Health Report */}
            <div className="space-y-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="glass-panel-light rounded-3xl p-8">
                {/* Health Score */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="45" fill="none"
                        stroke="#10b981"
                        strokeWidth="8" strokeLinecap="round" strokeDasharray="283"
                        strokeDashoffset={283 - (283 * 87) / 100}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-green-600">87</span>
                      <span className="text-sm text-gray-500">Health Score</span>
                    </div>
                  </div>
                </div>
                
                {/* Status */}
                <div className="text-center mb-6">
                  <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    ✓ Excellent Health Status
                  </span>
                </div>
                
                {/* Health Insights */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Health Insights
                  </h5>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Eye Health</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">Normal</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-700">Dental Care</span>
                      </div>
                      <span className="text-sm font-medium text-yellow-600">Minor Tartar</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Coat Condition</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">Healthy</span>
                    </div>
                  </div>
                </div>
                
                {/* Recommended Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h5 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-red-500" />
                    Recommended Actions
                  </h5>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-xs font-bold">1</span>
                        </div>
                        <div>
                          <h6 className="font-medium text-gray-900">Dental Cleaning</h6>
                          <p className="text-sm text-gray-600 mt-1">Schedule professional dental cleaning within 2-3 months</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 text-xs font-bold">2</span>
                        </div>
                        <div>
                          <h6 className="font-medium text-gray-900">Dental Chews</h6>
                          <p className="text-sm text-gray-600 mt-1">Use dental chews 2-3 times per week to reduce tartar buildup</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Medication Recommendations */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h5 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-purple-500" />
                    Medication Recommendations
                  </h5>
                  
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">RX</span>
                        </div>
                        <div className="flex-1">
                          <h6 className="font-medium text-gray-900">Dental Gel</h6>
                          <p className="text-sm text-gray-600">For daily oral care • Apply 2x daily</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">VT</span>
                        </div>
                        <div className="flex-1">
                          <h6 className="font-medium text-gray-900">Vitamin Supplements</h6>
                          <p className="text-sm text-gray-600">Support coat and immune health • Daily</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Confidence Level */}
                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Zap className="w-4 h-4" />
                    <span>AI Analysis Confidence: <strong className="text-green-600">95%</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  question: "How accurate is HealIPet's AI diagnosis?",
                  answer: "HealIPet uses advanced AI technology with a 95% accuracy rate based on extensive training data from veterinary professionals. However, results should be used as a preliminary assessment and not replace professional veterinary diagnosis."
                },
                {
                  question: "What types of pets can be analyzed?",
                  answer: "HealIPet currently supports analysis for cats and dogs. Simply upload a clear photo and our AI will analyze the pet's health condition, behavior, and potential concerns."
                },
                {
                  question: "Is my pet's data secure and private?",
                  answer: "Yes, all uploaded images and personal data are encrypted and processed with the highest security standards. We never store sensitive information without your explicit consent."
                },
                {
                  question: "How quickly will I receive results?",
                  answer: "Our AI analysis typically provides results within 3-5 seconds. You will receive a comprehensive health assessment including risk levels, recommendations, and care guidance."
                }
              ].map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-xl shadow-sm">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                  >
                    <span className="font-semibold text-gray-900 text-lg">{faq.question}</span>
                    <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${openFAQ === index ? 'rotate-90' : ''}`} />
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-6 text-base text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section id="testimonials" className="relative z-10 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              User <span className="gradient-text">Testimonials</span>
            </h2>
            <p className="text-xl text-gray-700">Trusted by pet owners worldwide</p>
          </div>
          
          {user && (
            <div className="text-center mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
              <button 
                onClick={() => setShowReviewModal(true)} 
                className="btn-secondary text-lg px-8 py-4 inline-flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Share Your Experience
              </button>
            </div>
          )}
          
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <TestimonialCard 
                key={review.id}
                avatar={review.avatar_url}
                name={review.user_name}
                pet={`${review.pet_type} · ${review.pet_name}`}
                content={review.content}
                rating={review.rating}
                delay={i * 150}
              />
            ))}
          </div>
          
          {/* Trust badges */}
          <div className="mt-16 flex justify-center opacity-0 animate-fade-in-up" style={{ animationDelay: '1400ms' }}>
            <div className="flex items-center gap-8 bg-white/90 rounded-2xl px-8 py-4 border border-gray-200 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text-green mb-1">4.9★</div>
                <div className="text-gray-600 text-sm">App Rating</div>
              </div>
              <div className="h-12 w-px bg-gray-200" />
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text-green mb-1">10K+</div>
                <div className="text-gray-600 text-sm">User Reviews</div>
              </div>
              <div className="h-12 w-px bg-gray-200" />
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text-green mb-1">98%</div>
                <div className="text-gray-600 text-sm">Recommendation Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative z-10 border-t border-gray-200 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 gradient-brand rounded-2xl flex items-center justify-center shadow-lg">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">HealIPet</span>
          </div>
          <p className="text-gray-700 text-lg mb-4">AI-Powered Pet Health Diagnostic Platform - Your Pet's Digital Healthcare Companion</p>
          <div className="flex items-center justify-center gap-6 text-gray-500 text-sm mb-6">
            <span>© 2024 HealIPet</span>
            <span>•</span>
            <button onClick={() => setCurrentPage('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => setCurrentPage('terms')} className="hover:text-blue-600 transition-colors">Terms of Service</button>
            <span>•</span>
            <button onClick={() => setCurrentPage('contact')} className="hover:text-blue-600 transition-colors">Contact Us</button>
          </div>
          
          {/* Language Switcher */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-gray-600 text-sm">Language:</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">EN</button>
              <button className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs hover:bg-gray-300 transition-colors">English</button>
              <button className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs hover:bg-gray-300 transition-colors">日本語</button>
              <button className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs hover:bg-gray-300 transition-colors">한국어</button>
            </div>
          </div>
          
          <p className="text-gray-400 text-xs mt-6">This service is for reference only and does not replace professional veterinary diagnosis. Please seek medical attention immediately for serious symptoms.</p>
        </div>
      </footer>

      {/* Floating particles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className="particle absolute" 
            style={{ 
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Enhanced Auth Modal - Light Theme */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
          
          {/* Floating particles */}
          <div className="particles">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className="particle" 
                style={{ 
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${8 + Math.random() * 4}s`,
                  background: 'rgba(0,0,0,0.1)'
                }}
              />
            ))}
          </div>
          
          <div className="relative auth-card-light rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            
            <div className="text-center mb-8">
              {/* Animated logo */}
              <div className="relative mb-6">
                <div className="w-20 h-20 gradient-brand rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                  <PawPrint className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-3xl border-2 border-blue-400/20 animate-ping" />
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                {authMode === 'login' ? 'Welcome Back' : 'Get Started'}
              </h3>
              <p className="text-gray-600 text-lg">
                {authMode === 'login' ? 'Sign in to access full features' : 'Create account to start AI diagnosis'}
              </p>
              
              {/* Quick stats */}
              <div className="flex justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>Secure Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Database className="w-4 h-4" />
                  <span>Data Protection</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 input-light text-gray-900 placeholder:text-gray-500 transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 input-light text-gray-900 placeholder:text-gray-500 transition-all"
                    placeholder={authMode === 'signup' ? 'At least 6 characters' : 'Enter password'}
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className={`text-sm p-4 rounded-2xl border ${
                  authError.includes('success') 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {authError}
                </div>
              )}

              <button 
                type="submit" 
                disabled={authLoading2} 
                className="w-full btn-primary disabled:opacity-50 py-4 text-lg font-semibold"
              >
                {authLoading2 ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {authMode === 'login' ? <LogIn className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  </div>
                )}
              </button>
            </form>

            {/* Auth mode switcher */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                <div className={`h-px w-12 ${authMode === 'login' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <span className="px-3">{authMode === 'login' ? 'Sign In' : 'Sign Up'}</span>
                <div className={`h-px w-12 ${authMode === 'signup' ? 'bg-blue-500' : 'bg-gray-300'}`} />
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
              </p>
              
              <button 
                onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }} 
                className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
              >
                {authMode === 'login' ? 'Sign up now' : 'Sign in now'}
              </button>
            </div>
            
            {/* Security note */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>SSL Encryption</span>
                </div>
                <div className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>Data Protection</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Privacy Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <History className="w-5 h-5" />My Diagnosis Records
              </h3>
              <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              {loadingHistory ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 text-neutral-400 mx-auto animate-spin" />
                  <p className="text-neutral-500 mt-2">Loading...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500">No diagnosis records</p>
                  <p className="text-sm text-neutral-400 mt-1">Upload pet photo to start your first diagnosis</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((record) => (
                    <div key={record.id} onClick={() => viewHistoryRecord(record)} className="flex gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-colors">
                      <img src={record.image_url} alt="Pet" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold" style={{ color: getScoreColor(record.health_score) }}>{record.health_score}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskBadgeClass(record.risk_level)}`}>{getRiskText(record.risk_level)}</span>
                        </div>
                        <p className="text-sm text-neutral-600 truncate">{record.symptoms || 'No symptoms described'}</p>
                        <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{formatDate(record.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-neutral-50">
              <button onClick={loadHistory} className="w-full btn-secondary flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />Refresh Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 p-1 hover:bg-neutral-100 rounded-lg">
              <X className="w-5 h-5 text-neutral-500" />
            </button>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Write a Review</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Pet type (e.g., Golden Retriever)" value={reviewForm.petType} onChange={e => setReviewForm({...reviewForm, petType: e.target.value})} className="px-3 py-2 border rounded-xl text-sm" />
                <input type="text" placeholder="Pet name" value={reviewForm.petName} onChange={e => setReviewForm({...reviewForm, petName: e.target.value})} className="px-3 py-2 border rounded-xl text-sm" />
              </div>
              <textarea placeholder="Share your experience..." value={reviewForm.content} onChange={e => setReviewForm({...reviewForm, content: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm h-24 resize-none" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">Rating:</span>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setReviewForm({...reviewForm, rating: n})} className={`w-8 h-8 rounded-full ${reviewForm.rating >= n ? 'bg-yellow-400' : 'bg-neutral-200'}`}>{n}</button>
                ))}
              </div>
              <button onClick={submitReview} disabled={submittingReview || !reviewForm.content.trim()} className="w-full btn-primary disabled:opacity-50">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Modal after Registration */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in-up">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 p-8 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <PawPrint className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to HealIPet! 🎉</h2>
            </div>
            
            {/* Content */}
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Your account has been successfully created.<br /><br />
                You're now part of <span className="font-semibold text-blue-600">HealIPet</span> — a place where your pet's health, comfort, and happiness come first.
              </p>
              
              <p className="text-gray-700 mb-8">
                Start exploring AI-powered health insights and give your furry friend the care they deserve.
              </p>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowWelcomeModal(false)
                    setShowDashboard(true)
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <Scan className="w-5 h-5" />
                  👉 Start My First Health Check
                </button>
                
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  👉 Get Started
                </button>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>Privacy Protected</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>Pet-First Care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <div className="glass-panel rounded-2xl p-6 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: `${600 + delay}ms` }}>
      <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <div className="text-primary-500">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm">{description}</p>
    </div>
  )
}

function TestimonialCard({ avatar, name, pet, content, rating, delay }: { avatar: string; name: string; pet: string; content: string; rating: number; delay: number }) {
  return (
    <div className="glass-panel rounded-2xl p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: `${800 + delay}ms` }}>
      <div className="flex items-center gap-3 mb-4">
        <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-primary-100" />
        <div>
          <h4 className="font-semibold text-neutral-900">{name}</h4>
          <p className="text-sm text-neutral-500">{pet}</p>
        </div>
      </div>
      <p className="text-neutral-600 text-sm mb-4 leading-relaxed">"{content}"</p>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-neutral-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  )
}

// Dashboard Component
function Dashboard({ user, onBack, userPoints, setUserPoints, onNavigate }: { user: any; onBack: () => void; userPoints: number; setUserPoints: React.Dispatch<React.SetStateAction<number>>; onNavigate: (page: string) => void }) {
  const [activeTab, setActiveTab] = useState('diagnosis')
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Free trial and subscription state
  const FREE_TRIAL_LIMIT = 1
  const [freeTrialUsed, setFreeTrialUsed] = useState(() => {
    const stored = localStorage.getItem(`healipet_trial_${user?.id}`)
    return stored ? parseInt(stored) : 0
  })
  const [isSubscribed, setIsSubscribed] = useState(() => {
    const stored = localStorage.getItem(`healipet_subscription_${user?.id}`)
    return stored === 'true'
  })

  // Check if user can use diagnosis
  const canUseDiagnosis = isSubscribed || freeTrialUsed < FREE_TRIAL_LIMIT
  const remainingFreeTrial = FREE_TRIAL_LIMIT - freeTrialUsed

  // Subscription plans configuration
  const plans = {
    monthly: {
      id: 'healipet_pro_monthly',
      name: 'Monthly',
      price: 9.99,
      period: '/month',
      features: ['Unlimited AI Diagnoses', 'Priority Support', 'Health History', 'Medication Tracking'],
      savings: null
    },
    yearly: {
      id: 'healipet_pro_yearly', 
      name: 'Yearly',
      price: 79.99,
      period: '/year',
      features: ['Unlimited AI Diagnoses', 'Priority Support', 'Health History', 'Medication Tracking', 'Family Pet Profiles'],
      savings: 'Save 33%'
    }
  }

  // Handle upgrade purchase via Creem.io
  const handleUpgrade = async (planType: 'monthly' | 'yearly') => {
    setIsPurchasing(true)
    const plan = plans[planType]
    try {
      const response = await fetch('https://uypjsyaozcpasykscqaq.supabase.co/functions/v1/creem-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: plan.id,
          success_url: window.location.origin + '?upgrade=success',
          customer_email: user?.email,
          metadata: { plan_type: planType }
        })
      })
      const data = await response.json()
      if (data.success && data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        alert('Failed to create checkout session. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Payment service error. Please try again later.')
    } finally {
      setIsPurchasing(false)
    }
  }

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // Handle image upload and AI diagnosis
  const handleDiagnosis = useCallback(async () => {
    if (!selectedImage) return

    // Check if user can use diagnosis
    if (!isSubscribed && freeTrialUsed >= FREE_TRIAL_LIMIT) {
      setShowUpgradePrompt(true)
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageData = e.target?.result as string
        
        try {
          // Call Edge Function for AI diagnosis
          const { data, error } = await supabase.functions.invoke('pet-diagnosis', {
            body: {
              imageData,
              fileName: selectedImage.name,
              userId: user?.id
            }
          })

          if (error) {
            console.error('AI diagnosis error:', error)
            alert('Diagnosis failed, please try again')
            return
          }

          if (data?.data?.diagnosis) {
            const diagnosis = data.data.diagnosis
            setCurrentDiagnosis({
              id: Date.now().toString(),
              healthScore: diagnosis.healthScore,
              riskLevel: diagnosis.riskLevel,
              diagnosis: diagnosis.diagnosis,
              description: diagnosis.description || 'No detailed description available',
              diseases: diagnosis.diseases || [],
              recommendations: diagnosis.recommendations || [],
              medications: diagnosis.medications || []
            })
            
            // Increase user points
            setUserPoints(prev => prev + 10)
            
            // Update free trial usage if not subscribed
            if (!isSubscribed) {
              const newUsage = freeTrialUsed + 1
              setFreeTrialUsed(newUsage)
              localStorage.setItem(`healipet_trial_${user?.id}`, newUsage.toString())
            }
          }
        } catch (err) {
          console.error('Diagnosis process error:', err)
          alert('Error occurred during diagnosis, please try again')
        } finally {
          setIsAnalyzing(false)
        }
      }
      reader.readAsDataURL(selectedImage)
    } catch (error) {
      console.error('File processing error:', error)
      setIsAnalyzing(false)
      alert('File processing failed, please try again')
    }
  }, [selectedImage, user, setUserPoints, isSubscribed, freeTrialUsed])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedImage(null)
    setImagePreview(null)
    setCurrentDiagnosis(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">HealIPet</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Welcome, {user.email?.split('@')[0]}
            </div>
            {/* Legal and Info Links for Dashboard */}
            <div className="hidden md:flex items-center gap-3 text-sm">
              <button 
                onClick={() => onNavigate('privacy')} 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy
              </button>
              <button 
                onClick={() => onNavigate('terms')} 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms
              </button>
            </div>
            <button 
              onClick={() => {/* logout logic */}} 
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
          <nav className="space-y-2">
            {[
              { id: 'diagnosis', label: 'AI Diagnosis', icon: Scan },
              { id: 'history', label: 'History', icon: History },
              { id: 'profile', label: 'Pet Profile', icon: User }
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              )
            })}
            
            {/* Upgrade to Pro Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowPricingModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Zap className="w-5 h-5" />
                Upgrade to Pro
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">Unlimited diagnoses & priority support</p>
            </div>
          </nav>
        </aside>

        {/* Pricing Modal */}
        {showPricingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Upgrade to Pro</h2>
                    <p className="text-gray-600 mt-1">Choose the plan that works for you</p>
                  </div>
                  <button onClick={() => setShowPricingModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Plan Toggle */}
                <div className="flex justify-center mb-8">
                  <div className="bg-gray-100 p-1 rounded-xl flex">
                    <button
                      onClick={() => setSelectedPlan('monthly')}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${selectedPlan === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setSelectedPlan('yearly')}
                      className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${selectedPlan === 'yearly' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                    >
                      Yearly
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Save 33%</span>
                    </button>
                  </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Monthly Plan */}
                  <div className={`border-2 rounded-2xl p-6 transition-all ${selectedPlan === 'monthly' ? 'border-purple-500 bg-purple-50/30' : 'border-gray-200'}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly Plan</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-bold text-gray-900">$9.99</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plans.monthly.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade('monthly')}
                      disabled={isPurchasing}
                      className={`w-full py-3 rounded-xl font-medium transition-all ${selectedPlan === 'monthly' ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-50`}
                    >
                      {isPurchasing ? 'Processing...' : 'Subscribe Monthly'}
                    </button>
                  </div>

                  {/* Yearly Plan */}
                  <div className={`border-2 rounded-2xl p-6 transition-all relative ${selectedPlan === 'yearly' ? 'border-purple-500 bg-purple-50/30' : 'border-gray-200'}`}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Yearly Plan</h3>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-bold text-gray-900">$79.99</span>
                      <span className="text-gray-600">/year</span>
                    </div>
                    <p className="text-green-600 text-sm mb-4">$6.67/month - Save $39.89/year</p>
                    <ul className="space-y-3 mb-6">
                      {plans.yearly.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade('yearly')}
                      disabled={isPurchasing}
                      className={`w-full py-3 rounded-xl font-medium transition-all ${selectedPlan === 'yearly' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-50`}
                    >
                      {isPurchasing ? 'Processing...' : 'Subscribe Yearly'}
                    </button>
                  </div>
                </div>

                {/* Features Comparison */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4 text-center">All Pro Features Include</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4">
                      <Scan className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-700">Unlimited Diagnoses</p>
                    </div>
                    <div className="p-4">
                      <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-700">Priority Support</p>
                    </div>
                    <div className="p-4">
                      <History className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-700">Health History</p>
                    </div>
                    <div className="p-4">
                      <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-700">Medication Tracking</p>
                    </div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RefreshCw className="w-4 h-4" />
                    <span>Cancel Anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Prompt Modal - When free trial is used */}
        {showUpgradePrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Free Trial Ended</h2>
              </div>
              
              {/* Content */}
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-4">
                  You've used your <span className="font-bold text-orange-600">1 free diagnosis</span>.
                </p>
                <p className="text-gray-700 mb-6">
                  Upgrade to Pro for unlimited AI health diagnoses and premium features!
                </p>

                {/* Plan highlights */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                  <h4 className="font-semibold text-gray-900 mb-3">Pro Benefits:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Unlimited AI Diagnoses
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Priority Support 24/7
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Complete Health History
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Medication Tracking
                    </li>
                  </ul>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowUpgradePrompt(false)
                      setShowPricingModal(true)
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    🚀 Upgrade to Pro - From $6.67/mo
                  </button>
                  
                  <button
                    onClick={() => setShowUpgradePrompt(false)}
                    className="w-full text-gray-500 hover:text-gray-700 font-medium py-2"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'diagnosis' && (
            <div className="max-w-6xl mx-auto">
              {/* Main Upload Area - Full Width */}
              <div className="w-full">
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-lg">
                  {/* Logo/Brand Icon */}
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <PawPrint className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Upload Pet Photo</h2>
                  <p className="text-gray-600 mb-4">Get instant AI health analysis for your pet</p>
                  
                  {/* Usage Status Badge */}
                  {isSubscribed ? (
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                      <Zap className="w-4 h-4" />
                      Pro Member - Unlimited Diagnoses
                    </div>
                  ) : (
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                      remainingFreeTrial > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {remainingFreeTrial > 0 ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          {remainingFreeTrial} Free Diagnosis Remaining
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          Free Trial Used - <button onClick={() => setShowPricingModal(true)} className="underline font-semibold">Upgrade Now</button>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Upload Area with Dashed Border */}
                  {!imagePreview ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-2xl p-12 mb-8 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer group"
                    >
                      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:text-blue-500 transition-colors" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Click or drag to upload photo</h3>
                      <p className="text-gray-500 text-sm">Support JPG, PNG formats, max 10MB</p>
                    </div>
                  ) : (
                    <div className="border-2 border-gray-200 rounded-2xl p-6 mb-8 bg-gray-50">
                      <div className="flex items-start gap-4">
                        <img 
                          src={imagePreview} 
                          alt="Selected pet" 
                          className="w-32 h-32 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Selected Image</h3>
                          <p className="text-sm text-gray-600 mb-4">{selectedImage?.name}</p>
                          <button 
                            onClick={clearSelection}
                            className="text-sm text-red-500 hover:text-red-700 font-medium"
                          >
                            Reselect
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feature Highlights */}
                  <div className="flex gap-4 mb-8">
                    <div className="flex-1 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-orange-500" />
                        <span className="font-semibold text-gray-900">3-5s Fast Analysis</span>
                      </div>
                      <p className="text-sm text-gray-600">Lightning fast diagnosis speed</p>
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold text-gray-900">Professional Health Score</span>
                      </div>
                      <p className="text-sm text-gray-600">Precise health assessment</p>
                    </div>
                  </div>

                  {/* Diagnosis Results */}
                  {currentDiagnosis && (
                    <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        Diagnosis Results
                      </h3>
                      
                      {/* Health Score */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative w-20 h-20">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                            <circle
                              cx="50" cy="50" r="45" fill="none"
                              stroke={currentDiagnosis.healthScore >= 80 ? '#10B981' : currentDiagnosis.healthScore >= 60 ? '#F59E0B' : '#EF4444'}
                              strokeWidth="8" strokeLinecap="round" strokeDasharray="283"
                              strokeDashoffset={283 - (283 * currentDiagnosis.healthScore) / 100}
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold" style={{ 
                              color: currentDiagnosis.healthScore >= 80 ? '#10B981' : currentDiagnosis.healthScore >= 60 ? '#F59E0B' : '#EF4444' 
                            }}>{currentDiagnosis.healthScore}</span>
                            <span className="text-xs text-gray-600">pts</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Health Score</h4>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            currentDiagnosis.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                            currentDiagnosis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {currentDiagnosis.riskLevel === 'low' ? 'Low Risk' : 
                             currentDiagnosis.riskLevel === 'medium' ? 'Medium Risk' : 'High Risk'}
                          </span>
                        </div>
                      </div>

                      {/* Detailed Description */}
                      {currentDiagnosis.description && (
                        <div className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-2">Detailed Analysis</h4>
                          <p className="text-sm text-blue-800 leading-relaxed">{currentDiagnosis.description}</p>
                        </div>
                      )}

                      {/* Medications */}
                      {currentDiagnosis.medications && currentDiagnosis.medications.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-purple-500" />
                            Medication Recommendations
                          </h4>
                          <div className="space-y-3">
                            {currentDiagnosis.medications.map((med, index) => (
                              <div key={index} className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Heart className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 mb-2">{med.name}</h5>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <span className="text-gray-600">Dosage:</span>
                                        <span className="text-gray-900">{med.dosage}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Frequency:</span>
                                        <span className="text-gray-900">{med.frequency}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="text-gray-900">{med.duration}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Purpose:</span>
                                        <span className="text-gray-900">{med.purpose}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Potential Issues */}
                      {currentDiagnosis.diseases.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Potential Health Issues</h4>
                          <div className="space-y-2">
                            {currentDiagnosis.diseases.map((disease, index) => (
                              <div key={index} className="flex items-center justify-between bg-white rounded-xl p-3">
                                <span className="text-sm font-medium text-gray-900">{disease.name}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{ 
                                        width: `${disease.probability}%`, 
                                        backgroundColor: disease.severity === 'high' ? '#EF4444' : disease.severity === 'medium' ? '#F59E0B' : '#10B981'
                                      }} 
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600 w-8">{disease.probability}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {currentDiagnosis.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Health Recommendations</h4>
                          <div className="space-y-3">
                            {currentDiagnosis.recommendations.map((rec, index) => (
                              <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-start gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    rec.priority === 'high' ? 'bg-red-100' : rec.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                                  }`}>
                                    <ChevronRight className={`w-4 h-4 ${
                                      rec.priority === 'high' ? 'text-red-500' : rec.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                                    }`} />
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-900">{rec.title}</h5>
                                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Action Button */}
                  <button 
                    onClick={handleDiagnosis}
                    disabled={!selectedImage || isAnalyzing}
                    className={`w-full font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg mb-6 ${
                      !selectedImage || isAnalyzing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
                    }`}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        AI is analyzing...
                      </div>
                    ) : (
                      'Start AI Diagnosis'
                    )}
                  </button>

                  {/* Secondary Action */}
                  <button className="text-gray-500 hover:text-gray-700 font-medium transition-colors">
                    View History
                  </button>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Privacy Protected</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Lock className="w-4 h-4" />
                      <span>Secure Data</span>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Diagnosis History</h2>
              <div className="text-center text-gray-500 py-12">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No diagnosis history yet</p>
                <p className="text-sm">Upload a photo to start your first diagnosis</p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pet Profile</h2>
              <div className="text-center text-gray-500 py-12">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No pet profiles added yet</p>
                <p className="text-sm">Add your pet's information for better diagnosis</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// Privacy Policy Component
const PrivacyPolicy = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Home
          </button>
          <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
          <div></div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            <p className="text-gray-600 mb-8"><strong>Effective Date:</strong> December 25, 2025</p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-6">
              HealIPet ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered pet health analysis service.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Email address when you create an account</li>
              <li>Pet photos you upload for analysis</li>
              <li>Health-related information you provide</li>
              <li>Usage data and analytics</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Provide AI-powered health analysis for your pet photos</li>
              <li>Improve our diagnostic accuracy and service quality</li>
              <li>Send important updates about your account and service</li>
              <li>Comply with legal obligations</li>
              <li>Protect against fraud and abuse</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share information only in these limited circumstances:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>With your explicit consent</li>
              <li>To comply with legal requirements or court orders</li>
              <li>To protect our rights, property, or safety</li>
              <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. AI and Image Processing</h2>
            <p className="text-gray-700 mb-6">
              Your pet photos are processed using artificial intelligence to provide health analysis. Images are processed securely and are not stored permanently unless you choose to save them in your account. We use industry-standard encryption to protect your data during transmission and storage.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Access and review your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability (receive a copy of your data)</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 mb-6">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Transfers</h2>
            <p className="text-gray-700 mb-6">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-gray-700">
                <strong>Email:</strong> support@healipet.ai<br />
                <strong>Address:</strong> HealIPet Privacy Team<br />
                123 Pet Health Street<br />
                Animal Care City, AC 12345
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                <strong>Disclaimer:</strong> This service provides health insights based on image analysis and should not replace professional veterinary care. Always consult with a qualified veterinarian for serious health concerns.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Terms of Service Component
const TermsOfService = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Home
          </button>
          <h1 className="text-xl font-bold text-gray-900">Terms of Service</h1>
          <div></div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
            <p className="text-gray-600 mb-8"><strong>Effective Date:</strong> December 25, 2025</p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using HealIPet ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
            <p className="text-gray-700 mb-6">
              HealIPet provides AI-powered health analysis for pets through image analysis. Our service uses artificial intelligence to assess pet health based on uploaded photographs and provide health insights and recommendations.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-700 mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Upload images that are illegal, harmful, threatening, abusive, or violate any laws</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Use the Service for any commercial purposes without our express written consent</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Health Disclaimer</h2>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
              <p className="text-yellow-800">
                <strong>Important Medical Disclaimer:</strong> HealIPet provides health insights for informational purposes only and should not replace professional veterinary care, diagnosis, or treatment. Always consult with a qualified veterinarian for health concerns about your pet. Our AI analysis is based on image recognition and may not detect all health issues.
              </p>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 mb-6">
              The Service and its original content, features, and functionality are owned by HealIPet and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy</h2>
            <p className="text-gray-700 mb-6">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Payment and Billing</h2>
            <p className="text-gray-700 mb-6">
              Certain features of the Service may require payment. You agree to pay all charges incurred by users of your account and credit card or other payment mechanism at the prices in effect when such charges are incurred.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-700 mb-6">
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 mb-6">
              In no event shall HealIPet be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which HealIPet operates, without regard to its conflict of law provisions.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Email:</strong> support@healipet.ai<br />
                <strong>Address:</strong> HealIPet Legal Team<br />
                123 Pet Health Street<br />
                Animal Care City, AC 12345
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Contact Us Component
const ContactUs = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Home
          </button>
          <h1 className="text-xl font-bold text-gray-900">Contact Us</h1>
          <div></div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Have questions about HealIPet? Need help with your pet's health analysis? We're here to help!
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                  <p className="text-gray-600 mb-2">Get help with your account, diagnosis, or technical issues</p>
                  <a href="mailto:support@healipet.ai" className="text-blue-600 hover:text-blue-700 font-medium">
                    support@healipet.ai
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Response time: Within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Phone Support</h3>
                  <p className="text-gray-600 mb-2">Speak directly with our support team</p>
                  <a href="tel:+1-555-PET-HEALTH" className="text-blue-600 hover:text-blue-700 font-medium">
                    +1 (555) PET-HEALTH
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Available: Mon-Fri, 9AM-6PM EST</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Office Address</h3>
                  <p className="text-gray-600">
                    123 Pet Health Street<br />
                    Animal Care City, AC 12345<br />
                    United States
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Emergency Situations</h4>
              <p className="text-blue-800 text-sm">
                If your pet is experiencing a medical emergency, please contact your local veterinarian or emergency animal hospital immediately. HealIPet is for informational purposes only and cannot provide emergency medical care.
              </p>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Account Issues</option>
                  <option>Billing Question</option>
                  <option>Partnership Opportunity</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Please describe your question or issue in detail..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
              <div className="space-y-2">
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  FAQ - Frequently Asked Questions
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  User Guide and Tutorials
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  API Documentation
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  System Status
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Support Hours */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Support Hours</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600">24/7</p>
              <p className="text-sm text-gray-500">Response within 24 hours</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600">Mon - Fri</p>
              <p className="text-sm text-gray-500">9:00 AM - 6:00 PM EST</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Emergency Support</h3>
              <p className="text-gray-600">Critical Issues Only</p>
              <p className="text-sm text-gray-500">Service downtime, security</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// About Us Component
const AboutUs = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Home
          </button>
          <h1 className="text-xl font-bold text-gray-900">About HealIPet</h1>
          <div></div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <PawPrint className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About HealIPet</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionizing pet healthcare through artificial intelligence. We believe every pet deserves access to quality health insights.
            </p>
          </div>
        </div>
        
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700">
              To make pet health monitoring accessible to everyone, everywhere. By combining cutting-edge AI technology with veterinary expertise, we provide pet owners with instant, reliable health insights that empower them to make informed decisions about their beloved companions.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-700">
              A world where no pet suffers from preventable health issues due to delayed detection. We envision AI-powered pet healthcare becoming as routine and accessible as human health monitoring, leading to longer, happier lives for pets everywhere.
            </p>
          </div>
        </div>
        
        {/* How It Works */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How HealIPet Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Upload Photo</h3>
              <p className="text-gray-600 text-sm">Take a clear photo of your pet and upload it to our secure platform</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. AI Analysis</h3>
              <p className="text-gray-600 text-sm">Our advanced AI analyzes your pet's image in seconds using machine learning</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Health Insights</h3>
              <p className="text-gray-600 text-sm">Receive detailed health scores, risk assessments, and personalized recommendations</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">4. Take Action</h3>
              <p className="text-gray-600 text-sm">Follow our recommendations and track your pet's health over time</p>
            </div>
          </div>
        </div>
        
        {/* Technology */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Technology</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Advanced AI Models</h3>
              <p className="text-gray-700 text-sm">
                We use state-of-the-art computer vision and machine learning models trained on millions of pet images to provide accurate health assessments.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Veterinary Expertise</h3>
              <p className="text-gray-700 text-sm">
                Our AI is trained and validated by board-certified veterinarians to ensure clinical accuracy and reliability of health insights.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Continuous Learning</h3>
              <p className="text-gray-700 text-sm">
                Our system continuously learns from new data and veterinary research to improve accuracy and expand detection capabilities.
              </p>
            </div>
          </div>
        </div>
        
        {/* Team & Values */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Privacy & Security
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                Your pet's photos and health data are protected with enterprise-grade security. We never share your information without explicit consent.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Pet Welfare First
              </h3>
              <p className="text-gray-700 text-sm">
                Every decision we make prioritizes the health and wellbeing of pets. We never compromise on the quality of our health assessments.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                Transparency
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                We clearly communicate what our AI can and cannot do. Our health insights are for guidance, not a substitute for professional veterinary care.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Innovation
              </h3>
              <p className="text-gray-700 text-sm">
                We continuously push the boundaries of what's possible in AI-powered pet healthcare, always with the goal of improving pet lives.
              </p>
            </div>
          </div>
        </div>
        
        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
          <p className="text-blue-100 mb-6">
            We'd love to hear from you. Get in touch with our team to learn more about HealIPet.
          </p>
          <button 
            onClick={() => onBack()}
            className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Contact Us
          </button>
        </div>
      </main>
    </div>
  )
}

// Admin Panel Component
const AdminPanel = ({ onBack }: { onBack: () => void }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    totalDiagnoses: 0,
    diagnosesToday: 0,
    proSubscribers: 0,
    monthlyRevenue: 0,
    activeUsers: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  // Admin password (in production, use secure auth)
  const ADMIN_PASSWORD = 'healipet2024'

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setAuthError('')
      loadDashboardData()
    } else {
      setAuthError('Invalid admin password')
    }
  }

  const loadDashboardData = async () => {
    // Simulate loading data - in production, fetch from Supabase
    try {
      // Get user stats from Supabase
      const { data: usersData } = await supabase.from('auth.users').select('*').limit(100)
      const { data: diagnosesData } = await supabase.from('pet_diagnoses').select('*')
      
      // Calculate stats (using demo data for now)
      const today = new Date().toISOString().split('T')[0]
      
      setStats({
        totalUsers: 1247,
        newUsersToday: 23,
        totalDiagnoses: 8934,
        diagnosesToday: 156,
        proSubscribers: 342,
        monthlyRevenue: 2847.50,
        activeUsers: 489
      })

      setRecentActivity([
        { id: 1, type: 'signup', user: 'john@example.com', time: '2 minutes ago', detail: 'New user registered' },
        { id: 2, type: 'diagnosis', user: 'sarah@pet.com', time: '5 minutes ago', detail: 'Cat health check - Score: 85' },
        { id: 3, type: 'subscription', user: 'mike@mail.com', time: '12 minutes ago', detail: 'Upgraded to Pro (Yearly)' },
        { id: 4, type: 'diagnosis', user: 'lisa@gmail.com', time: '18 minutes ago', detail: 'Dog diagnosis - Score: 92' },
        { id: 5, type: 'signup', user: 'alex@company.com', time: '25 minutes ago', detail: 'New user registered' },
        { id: 6, type: 'subscription', user: 'emma@outlook.com', time: '32 minutes ago', detail: 'Upgraded to Pro (Monthly)' },
        { id: 7, type: 'diagnosis', user: 'david@mail.com', time: '45 minutes ago', detail: 'Dog health check - Score: 78' },
        { id: 8, type: 'diagnosis', user: 'anna@pet.com', time: '1 hour ago', detail: 'Cat diagnosis - Score: 88' },
      ])

      setUsers([
        { id: 1, email: 'john@example.com', plan: 'Pro', diagnoses: 45, joined: '2024-12-15', lastActive: '2 hours ago' },
        { id: 2, email: 'sarah@pet.com', plan: 'Pro', diagnoses: 32, joined: '2024-12-10', lastActive: '5 minutes ago' },
        { id: 3, email: 'mike@mail.com', plan: 'Free', diagnoses: 1, joined: '2024-12-28', lastActive: '1 day ago' },
        { id: 4, email: 'lisa@gmail.com', plan: 'Pro', diagnoses: 28, joined: '2024-11-20', lastActive: '3 hours ago' },
        { id: 5, email: 'alex@company.com', plan: 'Free', diagnoses: 0, joined: '2024-12-30', lastActive: 'Just now' },
      ])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  // Admin Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-gray-400 mt-2">HealIPet Management Console</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter admin password"
              />
            </div>

            {authError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-300 text-sm">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition-colors"
            >
              Access Dashboard
            </button>
          </form>

          <button
            onClick={onBack}
            className="w-full mt-4 text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Website
          </button>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">HealIPet Admin</h1>
              <p className="text-sm text-gray-500">Management Console</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
            <button
              onClick={() => loadDashboardData()}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Exit Admin
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-green-500 text-sm font-medium">+{stats.newUsersToday} today</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Total Users</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Scan className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-green-500 text-sm font-medium">+{stats.diagnosesToday} today</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.totalDiagnoses.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Total Diagnoses</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-purple-500 text-sm font-medium">Pro</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.proSubscribers}</h3>
            <p className="text-gray-600 text-sm">Pro Subscribers</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-green-500 text-sm font-medium">+12%</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Monthly Revenue</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6">
              {['overview', 'users', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'signup' ? 'bg-blue-100' :
                          activity.type === 'diagnosis' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          {activity.type === 'signup' && <User className="w-5 h-5 text-blue-600" />}
                          {activity.type === 'diagnosis' && <Scan className="w-5 h-5 text-green-600" />}
                          {activity.type === 'subscription' && <Zap className="w-5 h-5 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.detail}</p>
                          <p className="text-sm text-gray-500">{activity.user}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Plan</th>
                        <th className="pb-3 font-medium">Diagnoses</th>
                        <th className="pb-3 font-medium">Joined</th>
                        <th className="pb-3 font-medium">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="font-medium text-gray-900">{user.email}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.plan === 'Pro' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {user.plan}
                            </span>
                          </td>
                          <td className="py-4 text-gray-600">{user.diagnoses}</td>
                          <td className="py-4 text-gray-600">{user.joined}</td>
                          <td className="py-4 text-gray-500 text-sm">{user.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Diagnoses by Day */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Diagnoses (Last 7 Days)</h4>
                    <div className="flex items-end gap-2 h-40">
                      {[120, 145, 132, 178, 156, 189, 156].map((value, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                            style={{ height: `${(value / 200) * 100}%` }}
                          />
                          <span className="text-xs text-gray-500">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Revenue by Plan */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Revenue by Plan</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Monthly Plan</span>
                          <span className="font-medium">$1,247.50</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '44%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Yearly Plan</span>
                          <span className="font-medium">$1,600.00</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '56%' }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue</span>
                        <span className="font-bold text-gray-900">$2,847.50</span>
                      </div>
                    </div>
                  </div>

                  {/* User Growth */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-medium text-gray-900 mb-4">User Growth</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">This Month</span>
                        <span className="text-green-600 font-medium">+234 users</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Last Month</span>
                        <span className="text-gray-900 font-medium">+198 users</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Growth Rate</span>
                        <span className="text-green-600 font-medium">+18.2%</span>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Conversion Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Free to Pro</span>
                        <span className="text-purple-600 font-medium">27.4%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Trial Completion</span>
                        <span className="text-blue-600 font-medium">89.2%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Churn Rate</span>
                        <span className="text-red-600 font-medium">3.1%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
