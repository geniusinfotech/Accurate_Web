'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, Leaf } from 'lucide-react'
import { PageFrame } from '@/components/storefront'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/Toast'

export default function SignupPage() {
  const router = useRouter()
  const { register, login, isLoading: authLoading } = useAuth()
  const { success, error } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const [firstname, ...rest] = formData.name.trim().split(/\s+/)
      const user = await register({
        firstname,
        lastname: rest.join(' ') || firstname,
        email: formData.email,
        password: formData.password,
      })
      if (user) {
        success('Account created successfully!')
        const loggedInUser = await login(formData.email, formData.password)
        if (loggedInUser) {
          if (loggedInUser.role === 'admin' || loggedInUser.role === 'manager') {
            router.push('/admin')
          } else {
            router.push('/')
          }
        } else {
          router.push('/login')
        }
      }
    } catch (err: any) {
      const message = err?.message || 'Registration failed. Please try again.'
      error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageFrame>
      <main className="auth-page">
        <div className="auth-art auth-art-gold">
          <Leaf size={34} />
          <p className="eyebrow">join the good stuff</p>
          <h1>Make space<br />for <em>better.</em></h1>
          <p>Create an account for faster checkout and easier everyday care.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <Link href="/" className="wordmark">accurate<span>•</span></Link>
          <p className="eyebrow">new account</p>
          <h2>Let&apos;s begin.</h2>
          <p className="auth-muted">A few details, then you&apos;re in.</p>

          <label>
            Full name
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading || authLoading}
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && <span id="name-error" className="error-text">{errors.name}</span>}
          </label>

          <label>
            Email address
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading || authLoading}
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && <span id="email-error" className="error-text">{errors.email}</span>}
          </label>

          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="At least 8 characters"
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading || authLoading}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <span id="password-error" className="error-text">{errors.password}</span>}
          </label>

          <label>
            Confirm password
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm password"
                minLength={8}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading || authLoading}
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.confirmPassword && <span id="confirm-error" className="error-text">{errors.confirmPassword}</span>}
          </label>

          <button className="primary-button" type="submit" disabled={isLoading || authLoading}>
            {isLoading || authLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight size={17} />
              </>
            )}
          </button>

          <div className="auth-divider"><span>or</span></div>
          <button
            className="social-button flex items-center justify-center gap-2"
            type="button"
            disabled={isLoading || authLoading}
            onClick={() => {
              const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9010/api').replace(/\/+$/, '');
              window.location.href = `${base}/auth/google`;
            }}
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign up with Google
          </button>

          <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
        </form>
      </main>
    </PageFrame>
  )
}