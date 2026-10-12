'use client'

import { useState } from 'react'
import { CheckCircle2, Mail, MapPin, Loader2, Phone } from 'lucide-react'
import { PageFrame } from '@/components/storefront'
import { apiRequest } from '@/lib/api-client'
import { isValidPhone } from '@/lib/checkout'

const EMAIL = 'hello@accurateliquid.in'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const cleanPhone = formData.phone.trim().replace(/\D/g, '')
    if (!isValidPhone(cleanPhone)) {
      setError('Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9.')
      return
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      await apiRequest('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: cleanPhone,
          subject: formData.subject.trim() || 'General Inquiry',
          message: formData.message.trim(),
        }),
      })

      setSubmitted(true)
    } catch (err: any) {
      setError(err?.message || 'Could not send your message. Please try again or email us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageFrame>
      <main className="inner-page wrap contact-page">
        <p className="eyebrow">say hello</p>
        <h1>
          Let&apos;s keep<br />
          <em>in touch.</em>
        </h1>

        <div className="contact-grid">
          {submitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center sm:p-10">
              <CheckCircle2 size={44} className="mx-auto text-emerald-600 mb-4" />
              <h2 className="text-2xl font-bold text-charcoal">Message Sent!</h2>
              <p className="mt-2 text-sm text-charcoal/80 max-w-md mx-auto">
                Thank you for reaching out, <strong>{formData.name}</strong>. Our team has received your note and will contact you at <strong>{formData.phone}</strong> or <strong>{formData.email}</strong> shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
                }}
                className="primary-button mt-6 inline-block cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-[#da3f51] mb-2">
                  {error}
                </div>
              )}

              <label>
                Name *
                <input
                  name="name"
                  required
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </label>

              <label>
                Email *
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </label>

              <label>
                Phone Number *
                <input
                  name="phone"
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit number (e.g. 9876543210)"
                  value={formData.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setFormData((prev) => ({ ...prev, phone: digits }))
                    if (error) setError('')
                  }}
                />
              </label>

              <label>
                Subject
                <input
                  name="subject"
                  placeholder="Order inquiry, wholesale, product question..."
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                />
              </label>

              <label>
                Message *
                <textarea
                  name="message"
                  required
                  placeholder="How can we help?"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                />
              </label>

              <button
                className="primary-button cursor-pointer flex items-center justify-center gap-2"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send message'
                )}
              </button>
            </form>
          )}

          <div className="contact-details">
            <h2>Visit or write</h2>
            <p>
              We&apos;re here for product questions, wholesale conversations, and thoughtful feedback.
            </p>
            <div className="flex items-start gap-2.5 mt-4">
              <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Varachha, Surat</strong>
                <span className="block text-muted text-sm">Gujarat, India</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 mt-3">
              <Mail size={18} className="text-primary shrink-0" />
              <a href={`mailto:${EMAIL}`} className="text-primary font-semibold hover:underline">
                {EMAIL}
              </a>
            </div>
          </div>
        </div>
      </main>
    </PageFrame>
  )
}
