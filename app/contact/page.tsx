'use client'
import { PageFrame } from '@/components/storefront'

const EMAIL = 'hello@accurateliquid.in'

// ponytail: opens the visitor's mail app (no backend endpoint); add a /contact API + email service if you need messages stored.
function sendMessage(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const f = new FormData(e.currentTarget)
  const body = `${f.get('message')}\n\n— ${f.get('name')} (${f.get('email')})`
  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Message from ${f.get('name')}`)}&body=${encodeURIComponent(body)}`
}

export default function Contact() { return <PageFrame><main className="inner-page wrap contact-page"><p className="eyebrow">say hello</p><h1>Let&apos;s keep<br /><em>in touch.</em></h1><div className="contact-grid"><form onSubmit={sendMessage}><label>Name<input name="name" required placeholder="Your name" /></label><label>Email<input name="email" required type="email" placeholder="you@example.com" /></label><label>Message<textarea name="message" required placeholder="How can we help?" rows={5} /></label><button className="primary-button" type="submit">Send message</button></form><div className="contact-details"><h2>Visit or write</h2><p>We&apos;re here for product questions, wholesale conversations, and thoughtful feedback.</p><strong>Varachha, Surat</strong><span>Gujarat, India</span><a href={`mailto:${EMAIL}`}>{EMAIL}</a></div></div></main></PageFrame> }
