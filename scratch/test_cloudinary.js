require('dotenv').config();
const { uploadToCloudinary } = require('../config/cloudinary');
const assert = require('assert');

async function testUpload() {
    console.log('--- Testing Cloudinary Buffer Stream Upload ---');
    
    // 1x1 transparent PNG buffer
    const samplePngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
    );

    const uploadedUrl = await uploadToCloudinary(samplePngBuffer, 'pritis_collection/products');
    console.log('Uploaded Image URL:', uploadedUrl);

    assert(typeof uploadedUrl === 'string', 'URL must be a string');
    assert(uploadedUrl.startsWith('https://res.cloudinary.com/'), 'URL must start with https://res.cloudinary.com/');
    assert(uploadedUrl.includes('pritis_collection/products'), 'URL must be in products folder');

    console.log('✅ ALL CLOUDINARY CHECKS PASSED SUCCESSFULLY!');
}

testUpload().catch(err => {
    console.error('❌ Upload failed:', err);
    process.exit(1);
});
