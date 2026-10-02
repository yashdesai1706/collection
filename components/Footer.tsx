import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube, ShieldCheck, Sparkles, Truck, Ruler } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full max-w-full bg-primary-dark text-cream pt-16 pb-8 border-t border-secondary/20">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Trust Badges Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b border-primary-light/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary flex-shrink-0">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-cream">100% Authentic Handloom</h4>
                            <p className="text-[11px] text-cream/70">Sourced directly from master artisans</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary flex-shrink-0">
                            <Ruler size={20} />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-cream">Custom Tailoring</h4>
                            <p className="text-[11px] text-cream/70">Bespoke fall, edging & blouse sizing</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary flex-shrink-0">
                            <Truck size={20} />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-cream">Express Shipping</h4>
                            <p className="text-[11px] text-cream/70">Pan-India & worldwide tracked delivery</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary flex-shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-cream">Secure Payments</h4>
                            <p className="text-[11px] text-cream/70">256-bit encrypted Razorpay checkout</p>
                        </div>
                    </div>
                </div>

                {/* Main 4-Column Footer */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-secondary/40 bg-white">
                                <Image
                                    src="/logo.jpg"
                                    alt="Priti's Collection"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="font-serif text-xl font-bold text-secondary">
                                Priti&apos;s Collection
                            </span>
                        </div>
                        <p className="text-cream/80 text-xs leading-relaxed">
                            A premier boutique celebrating the timeless grandeur of Indian handlooms, handwoven Banarasi silks, and contemporary ethnic silhouettes.
                        </p>
                        <p className="text-xs text-secondary-light font-medium">
                            Fashion That Defines You
                        </p>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h4 className="font-serif text-base font-semibold mb-4 text-secondary">Collections</h4>
                        <ul className="space-y-2 text-xs text-cream/75">
                            <li><Link href="/shop?search=saree" className="hover:text-secondary transition-colors">Banarasi & Kanjivaram Sarees</Link></li>
                            <li><Link href="/shop?search=anarkali" className="hover:text-secondary transition-colors">Festive Anarkalis & Gowns</Link></li>
                            <li><Link href="/shop?search=kurti" className="hover:text-secondary transition-colors">Everyday Chanderi Kurtis</Link></li>
                            <li><Link href="/shop?search=lehenga" className="hover:text-secondary transition-colors">Bridal Lehengas</Link></li>
                            <li><Link href="/new-arrivals" className="hover:text-secondary transition-colors">New Arrivals</Link></li>
                        </ul>
                    </div>

                    {/* Support & Services */}
                    <div>
                        <h4 className="font-serif text-base font-semibold mb-4 text-secondary">Customer Care</h4>
                        <ul className="space-y-2 text-xs text-cream/75">
                            <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Our Stylists</Link></li>
                            <li><Link href="/faq" className="hover:text-secondary transition-colors">Frequently Asked Questions</Link></li>
                            <li><Link href="/shipping" className="hover:text-secondary transition-colors">Shipping & Delivery Policy</Link></li>
                            <li><Link href="/privacy" className="hover:text-secondary transition-colors">Privacy & Security</Link></li>
                        </ul>
                    </div>

                    {/* Socials & Connect */}
                    <div>
                        <h4 className="font-serif text-base font-semibold mb-4 text-secondary">Stay Connected</h4>
                        <p className="text-xs text-cream/70 mb-4">
                            Follow our atelier on Instagram & YouTube for upcoming festive collections and styling tips.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://instagram.com/pritis.collection"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-secondary hover:bg-secondary hover:text-primary transition-all"
                                aria-label="Instagram"
                            >
                                <Instagram size={18} />
                            </a>
                            <a
                                href="https://www.youtube.com/@pritidesai1830"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-secondary hover:bg-secondary hover:text-primary transition-all"
                                aria-label="YouTube"
                            >
                                <Youtube size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-primary-light/30 mt-12 pt-8 text-center text-xs text-cream/50">
                    <p>&copy; {new Date().getFullYear()} Priti&apos;s Collection. All rights reserved. Handcrafted with pride.</p>
                </div>
            </div>
        </footer>
    );
}
