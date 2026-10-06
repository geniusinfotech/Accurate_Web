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

          <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
        </form>
      </main>
    </PageFrame>
  )
}