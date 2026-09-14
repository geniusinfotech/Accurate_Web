'use client'

import { useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import { ArrowRight, Check, Minus, Plus, Sparkles } from 'lucide-react'
import { PageFrame, ProductArt, ProductGrid, products } from '@/components/storefront'

export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const product = products.find((item) => item.id === Number(params.id))
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  if (!product) return notFound()
  return <PageFrame><main className="product-detail wrap"><div className="detail-crumb"><a href="/shop">Shop</a><span>/</span><span>{product.name}</span></div><div className="detail-grid"><div className="detail-visual"><ProductArt product={product} /><span className="detail-badge"><Sparkles size={14} /> everyday essential</span></div><div className="detail-copy"><p className="eyebrow">{product.category} · {product.size}</p><h1>{product.name}</h1><p className="detail-price">₹{product.price}</p><p className="detail-description">A thoughtful, effective formula made for everyday rituals. Gentle on the things you love, powerful where it counts.</p><div className="detail-points"><span><Check size={16} /> Made in Gujarat</span><span><Check size={16} /> Thoughtfully formulated</span><span><Check size={16} /> No unnecessary fuss</span></div><div className="buy-row"><div className="qty"><button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"><Minus size={14} /></button><span>{quantity}</span><button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity"><Plus size={14} /></button></div><button className="primary-button" onClick={() => setAdded(true)}>{added ? 'Added to cart' : 'Add to cart'} <ArrowRight size={17} /></button></div><p className="detail-note">Free delivery on orders above ₹499.</p></div></div><section className="detail-info"><div><p className="eyebrow">the details</p><h2>Clean should feel<br /><em>considered.</em></h2></div><div className="detail-copy-block"><p>We believe the things you use every day deserve the same care as the things you keep on display. Each Accurate formula is designed to work beautifully, look at home, and leave a lighter footprint.</p><div className="detail-meta"><span><b>How to use</b> Follow the label directions and enjoy the ritual.</span><span><b>Good to know</b> Store in a cool, dry place away from direct sunlight.</span></div></div></section><section className="related wrap"><div className="section-heading"><div><p className="eyebrow">you may also like</p><h2>Build your<br /><em>everyday edit.</em></h2></div></div><ProductGrid /></section></main></PageFrame>
}
