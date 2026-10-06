'use client';

import { useState } from 'react';
import { Check, ChevronDown, Droplets, Info, Leaf, PackageCheck, ShieldCheck, Sparkles } from 'lucide-react';
import type { StoreProduct } from '@/lib/product';

const TABS = [
  ['overview', 'Overview'],
  ['benefits', 'Benefits'],
  ['usage', 'How to use'],
  ['ingredients', 'Ingredients'],
  ['safety', 'Safety'],
  ['specs', 'Specifications'],
] as const;

type TabId = (typeof TABS)[number][0];

export function ProductTabs({ product }: { product: StoreProduct }) {
  const [active, setActive] = useState<TabId>('overview');

  return (
    <section className="product-wrap product-details-section mt-14 md:mt-20">
      <div className="details-heading">
        <div className="section-eyebrow">PRODUCT DETAILS</div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need<br /><em className="font-serif italic font-normal text-primary">to know.</em></h2>
      </div>

      <div className="details-content mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="detail-tabs flex lg:flex-col gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product details">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={active === id}
              onClick={() => setActive(id)}
              className={`flex items-center justify-between gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                active === id ? 'border-primary bg-primary/[0.06] text-charcoal' : 'border-border-gray bg-white text-muted hover:border-charcoal/30'
              }`}
            >
              {label}
              <ChevronDown size={15} className={`transition-transform ${active === id ? 'rotate-180' : ''}`} />
            </button>
          ))}
        </div>

        <div className="detail-panel rounded-3xl border border-border-gray/70 bg-white p-5 md:p-8" role="tabpanel">
          {active === 'overview' && (
            <div>
              <p className="text-[15px] leading-relaxed text-charcoal/85">{product.description}</p>
              {product.features.length > 0 && (
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 rounded-xl bg-cream px-3.5 py-2.5 text-sm text-charcoal/85">
                      <Check size={15} className="mt-0.5 shrink-0 text-emerald-600" />{f}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-border-gray bg-border-gray sm:grid-cols-2">
                <Spec label="Product" value={`${product.productForm || product.productType}${product.isConcentrated ? ' • Concentrated' : ''}`} />
                <Spec label="Packaging" value={[product.packaging?.type, product.packaging?.material, product.packaging?.closureType].filter(Boolean).join(' • ') || '—'} />
                <Spec label="Fragrance" value={product.availableFragrances.join(', ') || product.fragrance || '—'} />
                <Spec label="Shelf life" value={product.shelfLife || '—'} />
              </div>
            </div>
          )}

          {active === 'benefits' && (
            <div>
              {product.benefits.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {product.benefits.map((b, i) => (
                    <div key={b} className="rounded-2xl border border-border-gray/70 bg-cream/60 p-4">
                      <span className="text-xs font-bold text-muted">0{i + 1}</span>
                      <Sparkles size={20} className="my-2 text-primary" />
                      <h3 className="font-bold text-charcoal">{b}</h3>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted">Benefits listed on the pack.</p>}
              {product.features.length > 0 && (
                <>
                  <h4 className="mt-6 mb-2 text-sm font-bold uppercase tracking-widest text-muted">Features</h4>
                  <ul className="grid gap-2">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-charcoal/85"><Check size={15} className="mt-0.5 shrink-0 text-emerald-600" />{f}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {active === 'usage' && (
            <div className="grid gap-4">
              <DetailRow icon={<Droplets size={18} />} title="How to use" text={product.usage?.usageInstructions || 'Follow the dosage instructions on the pack. Use with machine or bucket wash as labelled.'} />
              {product.usage?.dilutionInstructions && <DetailRow icon={<Info size={18} />} title="Dilution" text={product.usage.dilutionInstructions} />}
              {product.usage?.recommendedDosage && <DetailRow icon={<Droplets size={18} />} title="Recommended dosage" text={product.usage.recommendedDosage} />}
              {(product.usage?.suitableFor?.length || product.usage?.notSuitableFor?.length) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {(product.usage?.suitableFor?.length ?? 0) > 0 && (
                    <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4">
                      <strong className="flex items-center gap-1.5 text-sm text-emerald-800"><Check size={15} /> Suitable for</strong>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {product.usage!.suitableFor!.map((s) => <span key={s} className="rounded-full bg-white border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800">{s}</span>)}
                      </div>
                    </div>
                  )}
                  {(product.usage?.notSuitableFor?.length ?? 0) > 0 && (
                    <div className="rounded-2xl bg-rose-50/70 border border-rose-100 p-4">
                      <strong className="flex items-center gap-1.5 text-sm text-rose-800"><Info size={15} /> Not suitable for</strong>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {product.usage!.notSuitableFor!.map((s) => <span key={s} className="rounded-full bg-white border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-800">{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {product.storageInstructions && <DetailRow icon={<PackageCheck size={18} />} title="Storage" text={product.storageInstructions} />}
            </div>
          )}

          {active === 'ingredients' && (
            <div>
              {product.ingredients.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 text-primary"><Leaf size={20} /><strong className="text-sm uppercase tracking-widest text-muted">What&apos;s inside</strong></div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.ingredients.map((ing) => (
                      <span key={ing} className="rounded-full border border-border-gray bg-cream px-3.5 py-1.5 text-sm font-medium text-charcoal/85">{ing}</span>
                    ))}
                  </div>
                </>
              ) : <p className="text-muted">Ingredient information is provided on the product label.</p>}
            </div>
          )}

          {active === 'safety' && (
            <div className="grid gap-4">
              {product.safety?.safetyInstructions && <DetailRow icon={<ShieldCheck size={18} />} title="Safety instructions" text={product.safety.safetyInstructions} />}
              {product.safety?.firstAidInstructions && <DetailRow icon={<Info size={18} />} title="First aid" text={product.safety.firstAidInstructions} />}
              <div className="grid gap-2 sm:grid-cols-2">
                {product.safety?.keepAwayFromChildren && <SafetyPoint>Keep away from children.</SafetyPoint>}
                {product.safety?.avoidEyeContact && <SafetyPoint>Avoid contact with eyes.</SafetyPoint>}
                {product.safety?.doNotIngest && <SafetyPoint>Do not ingest.</SafetyPoint>}
                {product.safety?.doNotMixWithOtherCleaners && <SafetyPoint>Do not mix with other cleaning products.</SafetyPoint>}
              </div>
              {!product.safety && <p className="text-muted">Refer to safety icons on the pack.</p>}
            </div>
          )}

          {active === 'specs' && (
            <div className="grid gap-px overflow-hidden rounded-2xl border border-border-gray bg-border-gray sm:grid-cols-2">
              <Spec label="SKU" value={product.sku || '—'} />
              <Spec label="Category" value={product.category} />
              <Spec label="Product type" value={product.productType} />
              <Spec label="Product form" value={product.productForm || '—'} />
              <Spec label="Concentrated" value={product.isConcentrated ? 'Yes' : 'No'} />
              {product.concentration && <Spec label="Concentration" value={product.concentration} />}
              <Spec label="Packaging type" value={product.packaging?.type || '—'} />
              <Spec label="Packaging material" value={product.packaging?.material || '—'} />
              <Spec label="Closure" value={product.packaging?.closureType || '—'} />
              <Spec label="Shelf life" value={product.shelfLife || '—'} />
              <Spec label="Storage" value={product.storageInstructions || '—'} />
              <Spec label="Certifications" value={product.certifications.join(', ') || '—'} />
              <Spec label="GST rate" value={product.gstRate || '—'} />
              <Spec label="Status" value={product.status || '—'} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-4 py-3">
      <span className="block text-[11px] font-bold uppercase tracking-widest text-muted">{label}</span>
      <strong className="mt-0.5 block text-sm font-semibold text-charcoal">{value}</strong>
    </div>
  );
}

function DetailRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border-gray/70 bg-white p-4">
      <div className="grid place-items-center w-9 h-9 shrink-0 rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div><strong className="block text-sm text-charcoal">{title}</strong><p className="mt-0.5 text-sm leading-relaxed text-charcoal/75">{text}</p></div>
    </div>
  );
}

function SafetyPoint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3.5 py-2.5 text-sm font-medium text-amber-900">
      <ShieldCheck size={17} className="shrink-0" /><span>{children}</span>
    </div>
  );
}
