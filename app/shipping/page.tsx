export default function ShippingPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary">Shipping & Policies</h1>
                <p className="text-foreground/70 mt-4">Transparent policies for a smooth shopping experience.</p>
            </div>

            <div className="prose prose-lg max-w-none text-foreground/80 font-sans">
                <div className="bg-white p-8 rounded-2xl border border-secondary/10 shadow-sm mb-12">
                    <h2 className="font-serif text-2xl text-primary font-bold mb-4">Shipping Policy</h2>
                    <ul className="space-y-4 list-disc pl-5">
                        <li>
                            <strong>Order Processing:</strong> All orders are processed within 1-2 business days. Orders placed on weekends or holidays will be processed on the next business day.
                        </li>
                        <li>
                            <strong>Shipping Timelines:</strong>
                            <ul className="pl-5 mt-2 space-y-1 text-sm">
                                <li>Metro Cities: 3-5 business days</li>
                                <li>Rest of India: 5-7 business days</li>
                                <li>Remote Locations: 7-10 business days</li>
                            </ul>
                            <p className="text-sm mt-2 text-foreground/60">Note: Timelines are estimates and may vary due to external factors like weather or courier delays.</p>
                        </li>
                        <li>
                            <strong>Shipping Charges:</strong> We offer free shipping on all orders above ₹499. value. A flat fee of ₹50 applies to orders below this amount.
                        </li>
                        <li>
                            <strong>Tracking:</strong> You will receive a shipment confirmation email/SMS with a tracking ID once your order is dispatched.
                        </li>
                    </ul>
                </div>

                <div className="bg-red-50 p-8 rounded-2xl border border-red-100 shadow-sm">
                    <h2 className="font-serif text-2xl text-red-800 font-bold mb-4">No Return & No Exchange Policy</h2>
                    <p className="mb-4 text-red-900/80">
                        At Pritis Collection, we take pride in offering high-quality traditional wear. To maintain fairness and hygiene standards, <strong>we strictly do not accept returns, refunds, or exchanges</strong> once an order has been delivered.
                    </p>

                    <h3 className="font-serif text-xl text-red-800 font-semibold mt-6 mb-3">Important Points</h3>
                    <ul className="space-y-2 list-disc pl-5 mb-6 text-red-900/80">
                        <li><strong>All Sales Are Final:</strong> Please review your order details, including size, color, and fabric, carefully before making a purchase.</li>
                        <li><strong>Size Guide:</strong> We provide detailed size charts for all products. If you are unsure about the fit, please contact us prior to ordering.</li>
                        <li><strong>Color Variation:</strong> Minor variations in color may occur due to screen settings and lighting conditions. This is not considered a defect.</li>
                    </ul>

                    <h3 className="font-serif text-xl text-red-800 font-semibold mt-6 mb-3">Damaged or Incorrect Items</h3>
                    <p className="text-red-900/80">
                        In the unlikely event that you receive a defective or incorrect item, please notify us within <strong>24 hours of delivery</strong>.
                    </p>
                    <ul className="space-y-2 list-disc pl-5 mt-2 text-red-900/80">
                        <li>Email us at <a href="mailto:pritidesai019@gmail.com" className="font-medium underline">pritidesai019@gmail.com</a> with your Order ID.</li>
                        <li>Attach a clear <strong>unboxing video</strong> and photos of the defect. Without an unboxing video, claims may not be processed.</li>
                        <li>If the claim is valid, we will provide a solution (replacement or store credit) at our sole discretion.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
