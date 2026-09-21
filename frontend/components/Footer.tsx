import Link from "next/link";
import { Instagram, Youtube } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-primary-dark text-cream pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="font-serif text-2xl font-bold text-secondary">Pritis Collection</h3>
                        <p className="text-cream/80 text-sm leading-relaxed">
                            Discover the elegance of traditional Indian wear with a modern touch. Premium Sarees, Kurtis & more.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-serif text-lg font-semibold mb-4 text-secondary-light">Shop</h4>
                        <ul className="space-y-2 text-sm text-cream/70">
                            <li><Link href="/shop?search=saree" className="hover:text-secondary transition-colors">Sarees</Link></li>
                            <li><Link href="/shop?search=kurti" className="hover:text-secondary transition-colors">Kurtis</Link></li>
                            <li><Link href="/shop?search=dress" className="hover:text-secondary transition-colors">Dresses</Link></li>
                            <li><Link href="/new-arrivals" className="hover:text-secondary transition-colors">New Arrivals</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-serif text-lg font-semibold mb-4 text-secondary-light">Support</h4>
                        <ul className="space-y-2 text-sm text-cream/70">
                            <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
                            <li><Link href="/faq" className="hover:text-secondary transition-colors">FAQs</Link></li>
                            <li><Link href="/shipping" className="hover:text-secondary transition-colors">Shipping & Returns</Link></li>
                            <li><Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div>
                        <h4 className="font-serif text-lg font-semibold mb-4 text-secondary-light">Follow Us</h4>
                        <p className="text-sm text-cream/70 mb-4">Stay connected with our latest collections.</p>
                        <div className="flex space-x-4">
                            <a href="https://instagram.com/pritis.collection" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-white transition-colors">
                                <Instagram size={24} />
                            </a>
                            <a href="https://www.youtube.com/@pritidesai1830" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-white transition-colors">
                                <Youtube size={24} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-primary-light/30 mt-12 pt-8 text-center text-xs text-cream/50">
                    <p>&copy; {new Date().getFullYear()} Pritis Collection. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
