'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ChevronDown, Globe2, Leaf, Menu, Minus, Plus, ShoppingBag, ShieldCheck, Sparkles, X } from 'lucide-react'

export type Product = { id: number; name: string; category: string; price: number; size: string; color: string; kind: 'bottle' | 'pouch' | 'pump' | 'spray' }
export const products: Product[] = [
  { id: 1, name: 'Accurate Liquid', category: 'Laundry care', price: 249, size: '1 L', color: 'aqua', kind: 'bottle' },
  { id: 2, name: 'Umiyadham Floor Care', category: 'Home care', price: 199, size: '1 L', color: 'gold', kind: 'bottle' },
  { id: 3, name: 'Pure Hands Wash', category: 'Personal care', price: 149, size: '500 ml', color: 'coral', kind: 'pump' },
  { id: 4, name: 'Accurate Refill Pack', category: 'Refill pouch', price: 399, size: '2 L', color: 'sage', kind: 'pouch' },
]

export function ProductArt({ product }: { product: Product }) {
  if (!product) return null
  return <div className={`product-art art-${product.color} art-${product.kind}`} aria-label={`${product.name} product illustration`} role="img">
    {product.kind === 'pouch' ? <div className="pouch"><span>ACCURATE</span><b>LIQUID</b><small>REFILL</small></div> : <div className="bottle"><div className="cap" /><div className="label"><span>{product.color === 'gold' ? 'UMIYADHAM' : 'ACCURATE'}</span><strong>{product.kind === 'pump' ? 'HANDS' : 'LIQUID'}</strong><small>{product.size}</small></div></div>}
    <span className="art-sparkle">✦</span>
  </div>
}

export function SiteHeader({ onCart, count = 0 }: { onCart: () => void; count?: number }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <header className={`nav ${menuOpen ? 'menu-open' : ''}`}><Link href="/" className="wordmark">accurate<span>•</span></Link><nav><Link href="/shop">Shop</Link><Link href="/about">Our story</Link><Link href="/faq">FAQ</Link><Link href="/contact">Contact</Link><Link href="/login">Account</Link></nav><button className="cart-button" onClick={onCart} aria-label={`Open cart with ${count} items`}><ShoppingBag size={18} /><span>Cart</span>{count > 0 && <b>{count}</b>}</button><button className="mobile-menu" onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}><Menu size={22} /></button></header>
}

export function CartDrawer({ cart, setCart, open, setOpen }: { cart: Record<number, number>; setCart: React.Dispatch<React.SetStateAction<Record<number, number>>>; open: boolean; setOpen: (value: boolean) => void }) {
  if (!open) return null
  const totalItems = Object.values(cart).reduce((sum, count) => sum + count, 0)
  const subtotal = products.reduce((sum, product) => sum + product.price * (cart[product.id] || 0), 0)
  const change = (id: number, delta: number) => setCart((current) => ({ ...current, [id]: Math.max(0, (current[id] || 0) + delta) }))
  return <div className="overlay" onClick={() => setOpen(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><p className="eyebrow">your selection</p><h2>Cart <span>({totalItems})</span></h2></div><button onClick={() => setOpen(false)} aria-label="Close cart"><X /></button></div>{totalItems === 0 ? <div className="empty-cart"><ShoppingBag size={34} /><p>Your cart is waiting<br />for something good.</p><button onClick={() => setOpen(false)}>Continue shopping</button></div> : <><div className="cart-items">{products.filter((p) => cart[p.id]).map((product) => <div className="cart-item" key={product.id}><ProductArt product={product} /><div><h3>{product.name}</h3><p>₹{product.price}</p><div className="qty"><button onClick={() => change(product.id, -1)}><Minus size={13} /></button><span>{cart[product.id]}</span><button onClick={() => change(product.id, 1)}><Plus size={13} /></button></div></div></div>)}</div><div className="cart-total"><span>Subtotal</span><strong>₹{subtotal}</strong></div><button className="checkout">Checkout <ArrowRight size={18} /></button></>}</aside></div>
}

export function SiteFooter() { return <footer className="footer wrap"><div><Link href="/" className="wordmark">accurate<span>•</span></Link><p>Better basics for everyday living.</p></div><div className="footer-links"><div><b>Explore</b><Link href="/shop">Shop all</Link><Link href="/about">Our story</Link><Link href="/shipping-returns">Shipping &amp; returns</Link></div><div><b>Visit us</b><span>Varachha, Surat</span><span>Gujarat, India</span></div><div className="newsletter"><b>Stay in the loop</b><div><input placeholder="Your email address" aria-label="Your email address" /><button aria-label="Subscribe"><ArrowRight size={17} /></button></div></div></div><div className="footer-bottom"><span>© 2024 Accurate Liquid</span><span>Made thoughtfully in India</span></div></footer> }

export function CartSite({ children }: { children: React.ReactNode }) { const [cart, setCart] = useState<Record<number, number>>({}); const [open, setOpen] = useState(false); const count = Object.values(cart).reduce((s, n) => s + n, 0); return <div className="site-shell"><SiteHeader onCart={() => setOpen(true)} count={count} />{children}<SiteFooter /><CartDrawer cart={cart} setCart={setCart} open={open} setOpen={setOpen} /></div> }

export function ProductGrid() { const [cart, setCart] = useState<Record<number, number>>({}); const add = (id: number) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 })); return <div className="product-grid">{products.map((product) => <article className="product-card" key={product.id}><div className="product-top"><span>{product.category}</span><span>{product.size}</span></div><ProductArt product={product} /><div className="product-info"><div><h3><a href={`/product/${product.id}`}>{product.name}</a></h3><p>Effective, effortless care.</p></div><strong>₹{product.price}</strong></div><button className="add-button" onClick={() => add(product.id)}><Plus size={16} /> Add to cart</button></article>)}</div>; }

export function CertificateModal({ open, close }: { open: boolean; close: () => void }) { if (!open) return null; return <div className="modal-backdrop" onClick={close}><div className="certificate-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={close} aria-label="Close certificates"><X /></button><div className="modal-seal">✓</div><p className="eyebrow">our promise, in writing</p><h2>Verified to the<br /><em>last drop.</em></h2>{['ISO 9001:2015 quality management', 'Genuine Trade Mark registered', 'Made in Gujarat, India'].map((text) => <div className="cert-row" key={text}><Check size={18} /><span>{text}</span></div>)}</div></div> }

export function PageFrame({ children }: { children: React.ReactNode }) { return <CartSite>{children}</CartSite> }
