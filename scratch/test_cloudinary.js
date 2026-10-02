require('dotenv').config();
const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Also test using CLOUDINARY_URL
process.env.CLOUDINARY_URL = `cloudinary://${apiKey}:${apiSecret}@${cloudName}`;
cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
});

async function checkAccount() {
    try {
        console.log('Fetching account usage details...');
        const usage = await cloudinary.api.usage();
        console.log('Usage details:', usage);
    } catch (e) {
        console.error('Usage Error:', e);
    }
}

checkAccount();
