export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-8">Privacy Policy</h1>

            <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-100 shadow-sm space-y-8 text-foreground/80 leading-relaxed">
                <div>
                    <h2 className="text-xl font-bold text-primary mb-3">1. Overview</h2>
                    <p>
                        Pritis Collection ("we," "us," or "our") is committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your information when you visit our website for the purpose of browsing or purchasing our products. By using our site, you agree to the collection and use of information in accordance with this policy.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-primary mb-3">2. Information Collection</h2>
                    <p className="mb-2">To fulfill your orders and provide a seamless shopping experience, we collect only necessary information, including:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Personal Information:</strong> Name, billing address, shipping address, email address, and phone number required for order processing and delivery.</li>
                        <li><strong>Order Details:</strong> Information about the products you purchase, sizes, and preferences.</li>
                        <li><strong>Payment Information:</strong> All payment transactions are processed through secure third-party gateways (e.g., Razorpay). We do not store your full credit/debit card details on our servers.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-primary mb-3">3. How We Use Your Data</h2>
                    <p>
                        We use the collected data strictly for the following purposes:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Order Fulfillment:</strong> To process and deliver your purchases accurately.</li>
                        <li><strong>Communication:</strong> To send you order confirmations, shipping updates, and customer support responses.</li>
                        <li><strong>Legal Compliance:</strong> To keep records of transactions as required by tax and legal authorities.</li>
                        <li><strong>Service Improvement:</strong> To analyze shopping patterns and improve our website functionality.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-primary mb-3">4. Data Protection</h2>
                    <p>
                        We implement industry-standard security measures to protect your personal information during transmission and storage. Access to your data is restricted to authorized personnel involved in the order fulfillment process.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-primary mb-3">5. Third-Party Disclosure</h2>
                    <p>
                        We do not sell, trade, or transfer your personally identifiable information to outside parties, except for trusted third parties who assist us in operating our website, conducting our business, or servicing you (e.g., courier partners), so long as those parties agree to keep this information confidential.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-primary mb-3">6. Contact Us</h2>
                    <p>
                        If you have questions regarding this privacy policy or how your data is handled, please contact us at: <a href="mailto:pritidesai019@gmail.com" className="text-secondary hover:underline">pritidesai019@gmail.com</a>.
                    </p>
                </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-12">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
    );
}
