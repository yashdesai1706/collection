"use client";

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const endpoint = baseUrl.endsWith('/api') ? `${baseUrl}/contact` : `${baseUrl}/api/contact`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
                <span className="text-secondary font-medium tracking-widest text-sm uppercase">Get In Touch</span>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mt-3">Contact Us</h1>
                <p className="text-foreground/70 mt-4 max-w-2xl mx-auto">
                    We'd love to hear from you. Whether you have a question about our collections, need styling advice,
                    or want to know more about your order.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                {/* Contact Info */}
                <div className="space-y-12">
                    <div className="bg-cream/50 p-8 rounded-xl border border-secondary/10">
                        <h3 className="text-xl font-serif font-semibold text-primary mb-6">Contact Information</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm text-secondary">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground/60 uppercase tracking-wide">Email</p>
                                    <a href="mailto:pritidesai019@gmail.com" className="text-lg font-medium text-primary hover:text-secondary transition-colors">
                                        pritichavare019@gmail.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm text-secondary">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground/60 uppercase tracking-wide">Phone & WhatsApp</p>
                                    <a
                                        href="https://wa.me/919075271108"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-lg font-medium text-primary hover:text-emerald-700 transition-colors block"
                                    >
                                        +91 9075271108 (WhatsApp Available)
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm text-secondary">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground/60 uppercase tracking-wide">Studio</p>
                                    <p className="text-lg font-medium text-primary">
                                        Pritis Collection<br />
                                        Kini, Kolhapur, Maharashtra, India
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-serif font-semibold text-primary mb-4">Customer Support Hours</h3>
                        <p className="text-foreground/70">
                            Monday - Saturday: 10:00 AM - 7:00 PM (IST)<br />
                            Sunday: Closed
                        </p>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-serif font-semibold text-primary mb-6">Send us a Message</h3>

                    {status === 'success' ? (
                        <div className="bg-green-50 text-green-700 p-6 rounded-lg text-center">
                            <p className="font-medium text-lg">Thank you for contacting us!</p>
                            <p className="text-sm mt-2">We have received your message and will get back to you shortly.</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-4 text-sm font-medium underline hover:text-green-800"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : status === 'error' ? (
                        <div className="bg-white p-6 rounded-lg text-center">
                            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                                <p className="font-medium">Something went wrong.</p>
                                <p className="text-sm">Please try again later or contact us directly.</p>
                            </div>
                            <button
                                onClick={() => setStatus('idle')}
                                className="text-sm font-medium underline hover:text-primary"
                            >
                                Try again
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-foreground/80">Your Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-gray-50/50"
                                        placeholder="Priri Desai"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-foreground/80">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-gray-50/50"
                                        placeholder="priti@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium text-foreground/80">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-gray-50/50"
                                    placeholder="Order Inquiry / Product Question"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-foreground/80">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-gray-50/50 resize-none"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full bg-primary text-white py-4 rounded-lg font-medium hover:bg-primary-light transition-all shadow-lg shadow-primary/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {status === 'submitting' ? 'Sending...' : (
                                    <>
                                        Send Message <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
