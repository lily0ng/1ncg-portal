'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, User, Mail, Lock, Smartphone, ChevronDown, Check, Building2, Shield, ArrowLeft, CreditCard, Zap, Globe } from 'lucide-react'
import { toast } from 'sonner'

const countries = [
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', dial: '+95' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dial: '+1' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dial: '+65' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dial: '+66' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dial: '+60' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dial: '+62' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dial: '+63' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dial: '+84' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dial: '+91' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dial: '+86' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dial: '+81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dial: '+82' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dial: '+61' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dial: '+44' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dial: '+49' },
]

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    accountType: 'individual',
    country: 'Myanmar',
    state: '',
    city: '',
    address: '',
    postalCode: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep1()) return
    
    setLoading(true)
    try {
      // First, send OTP to email
      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })

      const otpData = await otpRes.json()

      if (!otpRes.ok) {
        toast.error(otpData.error || 'Failed to send OTP')
        setLoading(false)
        return
      }

      // Show OTP to user for demo (remove in production)
      if (otpData.devOtp) {
        toast.success(`OTP sent! (Demo: ${otpData.devOtp})`)
      } else {
        toast.success('OTP sent to your email!')
      }
      
      setStep(2)
    } catch (err) {
      toast.error('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* Light Modern Background with Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Soft gradient orbs */}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-20 w-[400px] h-[400px] bg-pink-300/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-20 w-[350px] h-[350px] bg-purple-300/30 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, 50, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-1/4 w-[250px] h-[250px] bg-blue-300/20 rounded-full blur-[60px]"
        />
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-pink-400/20 rounded-full" />
        <div className="absolute bottom-32 left-10 w-16 h-16 bg-purple-400/20 rounded-full" />
        <div className="absolute top-1/2 left-20 w-12 h-12 bg-blue-400/20 rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-5xl mx-4"
      >
        {/* Modern White Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-purple-200/50 overflow-hidden flex flex-col lg:flex-row">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-white/5 to-transparent"
            >
              {/* Header with Sign in link */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">1CNG</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Already a member?</span>
                  <Link href="/login" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                    Sign in
                  </Link>
                </div>
              </div>

              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-8"
              >
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Sign up Now.
                </h1>
                <p className="text-gray-500 text-sm">
                  Enter your details below
                </p>
              </motion.div>

              {/* Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                onSubmit={handleCreateAccount}
                className="space-y-4"
              >
                {/* Full Name */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 hover:bg-white hover:shadow-lg hover:shadow-purple-100"
                    placeholder="Full Name"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1 text-left pl-4">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 hover:bg-white hover:shadow-lg hover:shadow-purple-100"
                    placeholder="Email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 text-left pl-4">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="relative flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center gap-2 pl-4 pr-3 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 hover:bg-white hover:shadow-lg hover:shadow-purple-100 transition-all duration-200 min-w-[80px]"
                    >
                      <span className="text-xl">{selectedCountry.flag}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                        {countries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country)
                              setShowCountryDropdown(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors text-left"
                          >
                            <span className="text-xl">{country.flag}</span>
                            <span className="text-sm">{country.name}</span>
                            <span className="text-gray-500 text-sm ml-auto">{country.dial}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative flex-1">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 hover:bg-white hover:shadow-lg hover:shadow-purple-100"
                      placeholder={selectedCountry.dial}
                    />
                  </div>
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs text-left pl-4 -mt-2">{errors.phone}</p>
                )}

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 hover:bg-white hover:shadow-lg hover:shadow-purple-100"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 text-left pl-4">{errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                    </>
                  )}
                </motion.button>

                {/* Sign In Link */}
                <p className="text-sm text-slate-400 pt-4">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    Sign in here
                  </Link>
                </p>
              </motion.form>
            </motion.div>
          ) : step === 2 ? (
            <StepTwoVerifyEmail 
              key="step2" 
              email={formData.email}
              fullName={formData.fullName}
              phone={`${selectedCountry.dial}${formData.phone}`}
              password={formData.password}
              onVerify={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          ) : step === 3 ? (
            <StepThreePayment
              key="step3"
              onComplete={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          ) : completed ? (
            <SuccessScreen />
          ) : (
            <StepFourKycAndTerms
              key="step4"
              onComplete={() => {
                toast.success('Registration completed successfully!')
                setCompleted(true)
              }}
              onBack={() => setStep(3)}
            />
          )}
        </AnimatePresence>

            {/* Right Side - Marketing Content (only on step 1) */}
            {step === 1 && (
              <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-purple-100/50 to-pink-100/50">
                {/* Decorative Elements */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-pink-300/30 rounded-full blur-2xl" />
                <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-300/30 rounded-full blur-2xl" />
                
                {/* Content */}
                <div className="relative z-10 p-12 flex flex-col justify-center h-full">
                  {/* Main Heading */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                  >
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                      The World Most<br />
                      Powerful Design{' '}
                      <span className="relative inline-block">
                        tool.
                        <span className="absolute -right-8 -top-2 w-16 h-16 bg-pink-300/50 rounded-full blur-xl" />
                      </span>
                    </h2>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 text-base leading-relaxed mb-8 max-w-md"
                  >
                    Create your own website with the Fastest Page Building Platform.
                  </motion.p>

                  {/* Feature Icons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-4"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-lg shadow-purple-100 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-lg shadow-purple-100 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-pink-500" />
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-lg shadow-purple-100 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-500" />
                    </div>
                  </motion.div>

                  {/* Floating decorative elements */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-20 right-10 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-2xl rotate-12"
                  />
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full"
                  />
                </div>
              </div>
            )}
        </div>
      </motion.div>
    </div>
  )
}

// Step 2: Verify Email
function StepTwoVerifyEmail({ 
  email, 
  fullName, 
  phone, 
  password,
  onVerify, 
  onBack 
}: { 
  email: string; 
  fullName: string;
  phone: string;
  password: string;
  onVerify: () => void; 
  onBack: () => void 
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handleVerify = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('Please enter the complete OTP')
      return
    }

    setLoading(true)
    try {
      // Step 1: Verify OTP using PUT endpoint
      const verifyRes = await fetch('/api/auth/send-otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        toast.error(verifyData.error || 'Invalid OTP')
        setLoading(false)
        return
      }

      toast.success('Email verified! Creating your account...')
      
      // Step 2: Create user after OTP verified
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
        }),
      })

      const registerData = await registerRes.json()

      if (!registerRes.ok) {
        toast.error(registerData.error || 'Registration failed')
        setLoading(false)
        return
      }

      toast.success('Account created successfully!')
      onVerify()
    } catch {
      toast.error('Verification failed')
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="text-center relative pt-8"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-0 left-0 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['Verify Email', 'Complete Payment', 'KYC', 'T&C'].map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              index === 0 ? 'bg-green-500 text-white' : 
              index === 1 ? 'bg-purple-600 text-white' : 
              'bg-gray-200 text-gray-500'
            }`}>
              {index === 0 ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            {index < 3 && <div className="w-8 h-px bg-gray-300" />}
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Verify Email Address
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        We have sent an OTP to your registered email address. If you did not receive it, please check your spam folder.
      </p>

      {/* Email Display */}
      <div className="flex items-center gap-3 mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
          <Mail className="w-5 h-5 text-purple-600" />
        </div>
        <span className="text-gray-900 flex-1 text-left font-medium">{email}</span>
      </div>

      {/* OTP Inputs */}
      <div className="flex justify-center gap-3 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-14 h-16 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-900 text-2xl font-bold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:bg-white hover:shadow-lg hover:shadow-purple-100"
          />
        ))}
      </div>

      {/* Resend OTP */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="text-gray-500 text-sm">Didn&apos;t receive OTP?</span>
        <button
          disabled={resendTimer > 0}
          className="text-sm border border-gray-200 bg-gray-50 rounded-full px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all disabled:opacity-50"
        >
          {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend'}
        </button>
      </div>

      {/* Verify Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleVerify}
        disabled={loading}
        className="w-full max-w-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-purple-200 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          'Verify OTP'
        )}
      </motion.button>
    </motion.div>
  )
}

// Step 3: Complete Payment
function StepThreePayment({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual')
  const [selectedAmount, setSelectedAmount] = useState(1000)
  const [loading, setLoading] = useState(false)

  const creditAmounts = [500, 1000, 2000, 3000, 4000, 5000]

  const handleProceed = async () => {
    setLoading(true)
    // Simulate payment processing
    setTimeout(() => {
      toast.success('Payment processed successfully!')
      setLoading(false)
      onComplete()
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="text-left relative"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute -top-2 left-0 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      {/* Header */}
      <div className="text-center mb-6 pt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Complete your registration process
        </h2>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[
          { num: 1, label: 'Verify Email Address', done: true },
          { num: 2, label: 'Complete Payment', done: false },
          { num: 3, label: 'KYC Verification', done: false },
          { num: 4, label: 'Accept T&C', done: false },
        ].map((step, index) => (
          <div key={step.label} className="flex items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-2 transition-colors ${
              step.done ? 'bg-green-500 text-white' : step.num === 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step.done ? <Check className="w-4 h-4" /> : step.num}
            </div>
            <span className="text-sm text-gray-500 hidden sm:inline">{step.label}</span>
            {index < 3 && <div className="w-8 h-px bg-gray-300 mx-2 hidden sm:block" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Account Type */}
          <div>
            <label className="text-sm text-gray-500 mb-3 block">I&apos;m signing up as an</label>
            <div className="flex gap-3">
              <button
                onClick={() => setAccountType('individual')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                  accountType === 'individual'
                    ? 'bg-purple-600 border-transparent text-white shadow-lg shadow-purple-200'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-white hover:shadow-lg hover:shadow-purple-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Individual</span>
              </button>
              <button
                onClick={() => setAccountType('company')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                  accountType === 'company'
                    ? 'bg-purple-600 border-transparent text-white shadow-lg shadow-purple-200'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-white hover:shadow-lg hover:shadow-purple-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="font-medium">Company</span>
              </button>
            </div>
          </div>

          {/* Billing Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-5">
            <h3 className="text-gray-900 font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-500" />
              Billing Details
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-2">Country*</label>
                <select className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:bg-gray-50">
                  <option>Myanmar (Burma)</option>
                  <option>Singapore</option>
                  <option>Thailand</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2">State*</label>
                <select className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:bg-gray-50">
                  <option>Yangon</option>
                  <option>Mandalay</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2">City*</label>
                <div className="relative">
                  <select className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:bg-gray-50">
                    <option>Yangon</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-2">Address*</label>
                <input
                  type="text"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:bg-gray-50"
                  placeholder="Enter Address"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2">Postal Code*</label>
                <input
                  type="text"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:bg-gray-50"
                  placeholder="Enter Postal Code"
                />
              </div>
            </div>
          </div>

          {/* Infra Credits */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <h3 className="text-gray-900 font-semibold text-sm mb-1 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-500" />
              Buy Infra Credits
            </h3>
            <p className="text-gray-500 text-xs mb-4 leading-relaxed">
              In order to create resources you should have enough infra credits into your account. You can refill infra credits or automated the refilling any time from the billing section.
            </p>

            <label className="text-xs text-red-500 block mb-3">Select Amount *</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {creditAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedAmount === amount
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-lg hover:shadow-purple-100'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>

            <label className="text-xs text-gray-500 block mb-2">Choose a payment method</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-purple-500 accent-purple-500" />
                <span className="text-sm text-gray-600">KBZ Pay</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* FAQs */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-gray-600 text-sm">Got questions? Get answers in our FAQs</p>
          </div>

          {/* Coupon */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-gray-600 text-sm mb-3">Have a coupon? Enter code below</p>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Enter Coupon Code"
              />
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors">Redeem</button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="text-gray-900 font-semibold mb-4">Summary</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cost of Infra Credits</span>
                <span className="text-gray-900 font-medium">{selectedAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Payable Amount</span>
                <span className="text-gray-900 font-medium">{selectedAmount}</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Effective wallet balance</p>
                  <p className="text-gray-900 font-semibold">{selectedAmount}</p>
                </div>
                <button
                  onClick={handleProceed}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-lg shadow-purple-200 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Proceed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Step 4: KYC & Terms
function StepFourKycAndTerms({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    if (!agreed) {
      toast.error('Please accept the terms and conditions')
      return
    }

    setLoading(true)
    // Simulate final registration
    setTimeout(() => {
      setLoading(false)
      onComplete()
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="text-center relative pt-8"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-0 left-0 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[
          { num: 1, done: true },
          { num: 2, done: true },
          { num: 3, done: true },
          { num: 4, done: false },
        ].map((step, index) => (
          <div key={index} className="flex items-center gap-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step.done ? 'bg-green-500 text-white' : 'bg-purple-600 text-white'
            }`}>
              {step.done ? <Check className="w-3 h-3" /> : step.num}
            </div>
            {index < 3 && <ChevronDown className="w-4 h-4 text-slate-600 rotate-[-90deg]" />}
          </div>
        ))}
      </div>

      <div className="backdrop-blur-xl bg-slate-800/30 border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-green-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Final Step
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Complete your registration by accepting our terms and conditions
        </p>

        <div className="text-left bg-slate-900/50 border border-white/10 rounded-xl p-4 mb-6 max-h-40 overflow-y-auto text-xs text-slate-400 leading-relaxed">
          <p className="mb-2"><strong className="text-slate-300">1. Acceptance of Terms</strong></p>
          <p className="mb-3">By accessing and using One Cloud Next-Gen services, you agree to be bound by these Terms and Conditions.</p>
          
          <p className="mb-2"><strong className="text-slate-300">2. Service Usage</strong></p>
          <p className="mb-3">You agree to use our services only for lawful purposes and in accordance with all applicable laws and regulations.</p>
          
          <p className="mb-2"><strong className="text-slate-300">3. Account Security</strong></p>
          <p className="mb-3">You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          
          <p className="mb-2"><strong className="text-slate-300">4. Payment Terms</strong></p>
          <p>You agree to pay all fees associated with your use of the services as specified in your selected plan.</p>
        </div>

        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 rounded border-white/20 bg-slate-900/50 text-blue-500 focus:ring-blue-500/50 mt-0.5"
          />
          <span className="text-sm text-slate-300 text-left">
            I have read and agree to the{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Terms and Conditions</a>
            {' '}and{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</a>
          </span>
        </label>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleComplete}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Complete Registration
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

// Success Screen Component (no routing)
function SuccessScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="text-center py-12"
    >
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Check className="w-12 h-12 text-green-500" />
        </motion.div>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-white mb-3"
      >
        Welcome to 1CNG!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-slate-400 mb-8"
      >
        Your account has been created successfully.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3 justify-center"
      >
        <Link
          href="/login"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-purple-200 inline-block"
        >
          Sign In
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="border border-gray-200 bg-gray-50 hover:bg-white text-gray-700 font-medium px-6 py-3 rounded-2xl transition-all hover:shadow-lg hover:shadow-purple-100"
        >
          Create Another Account
        </button>
      </motion.div>
    </motion.div>
  )
}
