require('dotenv').config();
const nodemailer = require('nodemailer');

const BOUTIQUE_PHONE = '919075271108';
const BOUTIQUE_EMAIL = 'pritichavare019@gmail.com';

/**
 * Configure Nodemailer transport using Gmail SMTP or custom environment variables.
 * Safe fallback: returns null if credentials are not configured.
 */
function getEmailTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
    });
}

/**
 * Clean and format Indian phone number for wa.me links
 */
function cleanPhoneNumber(rawPhone) {
    if (!rawPhone) return '';
    let digits = String(rawPhone).replace(/\D/g, '');
    if (digits.length === 10) {
        digits = '91' + digits;
    } else if (digits.length === 12 && digits.startsWith('91')) {
        return digits;
    }
    return digits;
}

/**
 * Generate human-friendly WhatsApp message for order tracking stages
 */
function formatWhatsAppMessage(order, statusOverride) {
    const status = statusOverride || order.status || 'Processing';
    const customerName = order.user?.name || 'Valued Customer';
    const orderId = order._id ? order._id.toString().slice(-8).toUpperCase() : 'ORDER';
    const total = (order.totalPrice || 0).toLocaleString('en-IN');
    const city = order.shippingAddress?.city || '';

    if (status === 'Ready for Delivery') {
        return `Namaste ${customerName}! ✨\n\nGreat news from *Priti's Collection*! 📦\n\nYour order *#${orderId}* is *ready for delivery*.\n🚚 *Delivery:* Delivering to ${city || 'your address'} within 2-3 working days.\n\nThank you for choosing Priti's Collection!`;
    }

    if (status === 'Delivered') {
        return `Namaste ${customerName}! ✨\n\nYour order *#${orderId}* from *Priti's Collection* has been *delivered*! 🎉\n\nWe hope you love your royal ethnic wear. Feel free to message us here if you have any questions or styling inquiries.\n\nThank you for shopping with us!`;
    }

    // Default: Processing / Confirmed
    return `Namaste ${customerName}! ✨\n\nThank you for shopping at *Priti's Collection*! 🛍️\n\nYour order *#${orderId}* (₹${total}) has been confirmed.\n\n📍 *Status:* Your order is being processed soon\n🚚 *Expected Delivery:* Within 2-3 working days\n\nWe will update you as soon as your parcel is ready for delivery.`;
}

/**
 * Generate WhatsApp URL for Admin to click and message the customer directly
 */
function getWhatsAppUrlForCustomer(order, statusOverride) {
    const rawPhone = order.shippingAddress?.phone || '';
    const phone = cleanPhoneNumber(rawPhone);
    const text = formatWhatsAppMessage(order, statusOverride);
    if (!phone) {
        return null;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate WhatsApp URL for Customer to click and connect with boutique support
 */
function getWhatsAppUrlForBoutique(order) {
    const orderId = order._id ? order._id.toString().slice(-8).toUpperCase() : '';
    const total = (order.totalPrice || 0).toLocaleString('en-IN');
    const text = `Namaste Priti's Collection! 🌸\nI have an inquiry regarding my order #${orderId} (₹${total}). Current status: ${order.status || 'Processing'}. Please share my delivery update.`;
    return `https://wa.me/${BOUTIQUE_PHONE}?text=${encodeURIComponent(text)}`;
}

/**
 * Send branded HTML notification email to customer (and boutique copy)
 */
async function sendOrderEmail({ order, statusOverride }) {
    const transporter = getEmailTransporter();
    const status = statusOverride || order.status || 'Processing';
    const orderId = order._id ? order._id.toString().slice(-8).toUpperCase() : 'ORDER';
    const customerEmail = order.user?.email || order.paymentResult?.email_address;
    const customerName = order.user?.name || 'Customer';

    let headline = 'Your order is being processed soon';
    let timelineNote = 'Estimated delivery within 2-3 working days across India';
    let badgeColor = '#6D121F';

    if (status === 'Ready for Delivery') {
        headline = 'Your order is ready for delivery';
        timelineNote = 'Dispatched for doorstep delivery within 2-3 working days';
        badgeColor = '#D4AF37';
    } else if (status === 'Delivered') {
        headline = 'Your order has been delivered';
        timelineNote = 'Delivered safely to your destination. We hope you love your boutique attire!';
        badgeColor = '#059669';
    }

    const itemsHtml = (order.orderItems || []).map(item => `
        <tr style="border-bottom: 1px solid #f1ece1;">
            <td style="padding: 12px 8px; font-size: 14px; color: #1F1F1F;">
                <strong>${item.name}</strong><br/>
                <span style="font-size: 12px; color: #78716c;">
                    ${item.size ? 'Size: ' + item.size : ''} ${item.color ? '| Color: ' + item.color : ''}
                </span>
            </td>
            <td style="padding: 12px 8px; font-size: 14px; text-align: center; color: #57534e;">
                ${item.qty}
            </td>
            <td style="padding: 12px 8px; font-size: 14px; text-align: right; color: #6D121F; font-weight: bold;">
                ₹${(item.price * item.qty).toLocaleString('en-IN')}
            </td>
        </tr>
    `).join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FDFBF7; color: #1F1F1F; margin: 0; padding: 24px; }
            .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e7dfd5; overflow: hidden; }
            .header { background: #6D121F; padding: 28px 24px; text-align: center; color: #FDFBF7; }
            .brand { font-family: Georgia, serif; font-size: 26px; font-weight: bold; letter-spacing: 0.5px; margin: 0; color: #D4AF37; }
            .tagline { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; color: #fce7db; }
            .content { padding: 28px 24px; }
            .status-banner { background: #faf6f0; border-left: 4px solid ${badgeColor}; padding: 16px; border-radius: 6px; margin-bottom: 24px; }
            .status-title { font-size: 16px; font-weight: bold; color: #1F1F1F; margin: 0 0 4px 0; }
            .status-desc { font-size: 13px; color: #6b655f; margin: 0; }
            .table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            .totals { margin-top: 20px; padding-top: 16px; border-top: 2px solid #e7dfd5; }
            .total-row { display: flex; justify-content: space-between; font-size: 13px; color: #6b655f; margin-bottom: 6px; }
            .total-final { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #6D121F; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f1ece1; }
            .footer { background: #faf6f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #78716c; border-top: 1px solid #e7dfd5; }
            .btn-wa { display: inline-block; background: #25D366; color: #ffffff !important; text-decoration: none; padding: 10px 20px; border-radius: 24px; font-weight: bold; font-size: 13px; margin-top: 16px; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <h1 class="brand">Priti's Collection</h1>
                <div class="tagline">Luxury Indian Ethnic & Bridal Wear</div>
            </div>
            <div class="content">
                <p style="font-size: 15px; margin-top: 0;">Namaste <strong>${customerName}</strong>,</p>

                <div class="status-banner">
                    <div class="status-title">${headline}</div>
                    <div class="status-desc">🚚 ${timelineNote}</div>
                </div>

                <p style="font-size: 13px; color: #6b655f;">
                    Order Reference: <strong style="color: #6D121F;">#${orderId}</strong><br/>
                    Order Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>

                <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #6D121F; margin-top: 24px; border-bottom: 1px solid #e7dfd5; padding-bottom: 8px;">
                    Order Summary
                </h3>

                <table class="table">
                    <thead>
                        <tr style="border-bottom: 2px solid #e7dfd5; font-size: 12px; text-transform: uppercase; color: #78716c;">
                            <th style="text-align: left; padding: 8px;">Garment</th>
                            <th style="text-align: center; padding: 8px;">Qty</th>
                            <th style="text-align: right; padding: 8px;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="totals">
                    <table style="width: 100%; font-size: 13px; color: #6b655f;">
                        <tr>
                            <td>Items Subtotal</td>
                            <td style="text-align: right;">₹${(order.itemsPrice || order.totalPrice).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td>Delivery Charges</td>
                            <td style="text-align: right;">${order.shippingPrice === 0 ? '<span style="color:#059669;font-weight:bold;">Free</span>' : '₹' + order.shippingPrice}</td>
                        </tr>
                        <tr style="font-size: 16px; font-weight: bold; color: #6D121F; border-top: 1px solid #e7dfd5;">
                            <td style="padding-top: 8px;">Total Paid</td>
                            <td style="padding-top: 8px; text-align: right;">₹${order.totalPrice.toLocaleString('en-IN')}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin-top: 24px; padding: 14px; background: #faf6f0; border-radius: 8px; font-size: 12px; color: #57534e;">
                    <strong>Shipping Address:</strong><br/>
                    ${order.shippingAddress?.address || ''}<br/>
                    ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.postalCode || ''}<br/>
                    ${order.shippingAddress?.country || 'India'}
                    ${order.shippingAddress?.phone ? '<br/><strong>Phone:</strong> ' + order.shippingAddress.phone : ''}
                </div>

                <div style="text-align: center; margin-top: 24px;">
                    <a href="https://wa.me/${BOUTIQUE_PHONE}?text=${encodeURIComponent('Namaste Priti\'s Collection! Inquiring about order #' + orderId)}" class="btn-wa">
                        Track via WhatsApp (9075271108)
                    </a>
                </div>
            </div>

            <div class="footer">
                Priti's Collection • Authentic Indian Ethnic Wear • Pan-India Delivery<br/>
                For inquiries or styling assistance, call/WhatsApp: +91 9075271108
            </div>
        </div>
    </body>
    </html>
    `;

    if (!transporter) {
        console.log(`[NotificationService] EMAIL_USER/EMAIL_PASS not configured. Skipping email dispatch to ${customerEmail || 'no-email'} for order #${orderId}`);
        return { success: false, skipped: true, reason: 'Credentials not set' };
    }

    if (!customerEmail) {
        console.warn(`[NotificationService] Order #${orderId} has no recipient email.`);
        return { success: false, skipped: true, reason: 'No customer email' };
    }

    try {
        await transporter.sendMail({
            from: `"Priti's Collection" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            bcc: BOUTIQUE_EMAIL, // Also notify boutique owner automatically
            subject: `${headline} - #${orderId} | Priti's Collection`,
            html: htmlContent
        });
        console.log(`[NotificationService] Email successfully sent to ${customerEmail} for order #${orderId} (${status})`);
        return { success: true };
    } catch (err) {
        console.error(`[NotificationService] Error sending email to ${customerEmail}:`, err.message);
        return { success: false, error: err.message };
    }
}

module.exports = {
    BOUTIQUE_PHONE,
    BOUTIQUE_EMAIL,
    cleanPhoneNumber,
    formatWhatsAppMessage,
    getWhatsAppUrlForCustomer,
    getWhatsAppUrlForBoutique,
    sendOrderEmail
};
