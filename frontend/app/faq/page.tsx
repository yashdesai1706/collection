"use client";

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            category: "Ordering & Policies",
            items: [
                {
                    question: "What is your return and refund policy?",
                    answer: "We follow a strict No Return and No Refund policy. Due to the nature of our products and to maintain hygiene standards, all sales are final. We advise customers to carefully check the product details, size chart, and description before placing an order."
                },
                {
                    question: "Can I exchange my product for a different size?",
                    answer: "We do not offer exchanges. Please refer to our detailed size chart provided on each product page or contact our support team if you need assistance with sizing before purchasing."
                },
                {
                    question: "What if I receive a damaged or wrong product?",
                    answer: "In the rare event that you receive a damaged or incorrect item, please contact us at pritidesai019@gmail.com within 24 hours of delivery with an unboxing video and clear photos. We will review the case and provide a solution."
                },
                {
                    question: "Can I cancel my order?",
                    answer: "You can request an order cancellation within 2 hours of placing the order by contacting our support team. Once the order has been processed or dispatched, it cannot be canceled."
                }
            ]
        },
        {
            category: "Shipping & Delivery",
            items: [
                {
                    question: "How can I track my order?",
                    answer: "Once your order is shipped, we will send you a tracking link via email/SMS. You can use this link to check the real-time status of your delivery."
                },
                {
                    question: "What are your shipping timelines?",
                    answer: "We typically value processing time of 1-2 business days. Standard delivery takes 5-7 business days for metro cities and 7-10 business days for other locations."
                }
            ]
        },
        {
            category: "Products & Sizing",
            items: [
                {
                    question: "Are the product colors accurate?",
                    answer: "We try our best to display accurate colors. However, due to lighting and different screen calibrations, there might be a slight variation in the actual color of the product."
                },
                {
                    question: "How do I choose the right size?",
                    answer: "Please refer to the size chart available on the product page. If you are in between sizes or unsure, we recommend reaching out to us for guidance."
                }
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
                <span className="text-secondary font-medium tracking-widest text-sm uppercase">Common Questions</span>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mt-3">Frequently Asked Questions</h1>
            </div>

            <div className="space-y-12">
                {faqs.map((section, sectionIdx) => (
                    <div key={sectionIdx}>
                        <h3 className="text-xl font-serif font-semibold text-primary mb-6 border-b border-gray-100 pb-2">{section.category}</h3>
                        <div className="space-y-4">
                            {section.items.map((faq, idx) => {
                                const globalIndex = sectionIdx * 10 + idx; // unique key strategy
                                const isOpen = openIndex === globalIndex;
                                return (
                                    <div key={idx} className="border border-gray-200 rounded-lg bg-white overflow-hidden transition-all duration-300">
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                                            className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                                        >
                                            <span className={`font-medium ${isOpen ? 'text-primary' : 'text-foreground'}`}>
                                                {faq.question}
                                            </span>
                                            {isOpen ? <Minus size={20} className="text-secondary" /> : <Plus size={20} className="text-gray-400" />}
                                        </button>
                                        <div
                                            className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="p-5 pt-0 text-foreground/70 leading-relaxed text-sm">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
