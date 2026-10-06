import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="footer wrap">
      <div>
        <Link href="/" className="wordmark">accurate<span>•</span></Link>
        <p>Better basics for everyday living.</p>
      </div>
      <div className="footer-links">
        <div>
          <b>Explore</b>
          <Link href="/shop">Shop all</Link>
          <Link href="/about">Our story</Link>
          <Link href="/shipping-returns">Shipping &amp; returns</Link>
        </div>
        <div>
          <b>Visit us</b>
          <span>Varachha, Surat</span>
          <span>Gujarat, India</span>
        </div>
        <div className="newsletter">
          <b>Stay in the loop</b>
          <div>
            <input placeholder="Your email address" aria-label="Your email address" />
            <button aria-label="Subscribe"><ArrowRight size={17} /></button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2024 Accurate Liquid</span>
        <span>Made thoughtfully in India</span>
      </div>
    </footer>
  );
}
