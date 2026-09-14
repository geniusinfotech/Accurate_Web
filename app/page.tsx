import Link from "next/link";
import { ArrowRight, Globe2, Leaf, ShieldCheck } from "lucide-react";
import {
  PageFrame,
  ProductArt,
  products,
  ProductGrid,
} from "@/components/storefront";

export default function Home() {
  return (
    <PageFrame>
      <main id="top">
        <section className="hero wrap">
          <div className="hero-copy">
            <h1>
              Pure clean.
              <br />
              <em>Certified</em> quality.
            </h1>
            <p className="hero-intro">
              Thoughtful home care for the spaces you live in. Effective
              formulas, honest ingredients, and a lighter footprint.
            </p>
            <Link className="primary-button" href="/shop">
              Explore products <ArrowRight size={18} />
            </Link>
            <div className="hero-note">
              <ShieldCheck size={18} />
              <span>Quality tested &amp; proudly made in Surat</span>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-stamp">
              <span>
                GOOD FOR
                <br />
                HOME
              </span>
              <Leaf size={28} />
            </div>
            <ProductArt product={products[1]} />
            <div className="hero-caption">
              <span>01 /</span>
              <b>Clean by nature</b>
              <small>Plant-powered, people-approved.</small>
            </div>
          </div>
        </section>
        <section className="promise-grid wrap">
          <div className="promise-card aqua-card">
            <span className="card-icon">
              <Leaf size={19} />
            </span>
            <h2>
              Kind to your
              <br />
              <em>kind of clean.</em>
            </h2>
            <p>Powerful where it matters. Gentle everywhere else.</p>
            <Link href="/about">
              Our ingredients <ArrowRight size={16} />
            </Link>
          </div>
          <div className="promise-card trust-card">
            <div className="seal">
              ✓
              <span>
                TRADE
                <br />
                MARK
              </span>
            </div>
            <div>
              <p className="eyebrow">verified quality</p>
              <h2>
                Made with
                <br />
                <em>intention.</em>
              </h2>
              <Link href="/about">
                View our promise <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="promise-card mini-card">
            <Globe2 size={24} />
            <p>
              Refill, reuse,
              <br />
              <strong>repeat.</strong>
            </p>
            <span>Less plastic. More purpose.</span>
          </div>
        </section>
        <section className="shop-section wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">the daily edit</p>
              <h2>
                Good things
                <br />
                <em>for clean spaces.</em>
              </h2>
            </div>
            <Link className="filter-button" href="/shop">
              Shop all <ArrowRight size={17} />
            </Link>
          </div>
          <ProductGrid />
        </section>
        <section className="story wrap">
          <div className="story-mark">
            A<span>/</span>U
          </div>
          <div>
            <p className="eyebrow">a little more than clean</p>
            <h2>
              Designed for the
              <br />
              <em>way you live.</em>
            </h2>
            <p>
              We believe a clean home should feel good, not clinical. Accurate
              and Umiyadham are built in Varachha, Surat, with a quiet
              commitment to better formulas and better days.
            </p>
            <Link className="text-link" href="/about">
              Read our story <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
