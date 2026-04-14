'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, Mail, Lock, Zap, Globe, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      if (data.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (data.role === 'RESELLER') {
        router.push('/reseller/dashboard')
      } else {
        router.push('/portal/dashboard')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* Light Modern Background with Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Soft gradient orbs */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-20 w-[400px] h-[400px] bg-pink-300/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-20 w-[350px] h-[350px] bg-purple-300/30 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-1/4 w-[250px] h-[250px] bg-blue-300/20 rounded-full blur-[60px]"
        />
        
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-pink-400/20 rounded-full" />
        <div className="absolute bottom-32 left-10 w-16 h-16 bg-purple-400/20 rounded-full" />
        <div className="absolute top-1/2 left-20 w-12 h-12 bg-blue-400/20 rounded-full" />
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-5xl mx-4 lg:mx-8"
      >
        {/* Modern White Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-purple-200/50 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Side - Login Form */}
          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Header with Sign up link */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">1CNG</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Not a member?</span>
                  <Link href="/signup" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                    Sign up now
                  </Link>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Sign in Now.
                </h1>
                <p className="text-gray-500 text-sm">
                  Enter your detail below
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Username or Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      // type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 hover:bg-white hover:shadow-lg hover:shadow-purple-100"
                      placeholder="yourmailg@gmail.com"
                      // required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <a href="#" className="text-xs text-purple-600 hover:text-purple-700 transition-colors font-medium">
                      Forget password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 hover:bg-white hover:shadow-lg hover:shadow-purple-100"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign in</span>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Right Side - Marketing Content */}
          <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-purple-100/50 to-pink-100/50">
            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-pink-300/30 rounded-full blur-2xl" />
            <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-300/30 rounded-full blur-2xl" />
            
            {/* 3D-like Illustration Container */}
            <div className="relative z-10 p-12 flex flex-col justify-center h-full">
              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
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
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-gray-600 text-base leading-relaxed mb-8 max-w-md"
              >
                Create your own website with the Fastest Page Building Platform.
              </motion.p>

              {/* Feature Icons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
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
        </div>

      </motion.div>
    </div>
  )
}
