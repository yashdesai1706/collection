require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'pxvojfmz',
    api_key: process.env.CLOUDINARY_API_KEY || '352547467662295',
    api_secret: process.env.CLOUDINARY_API_SECRET || '8HavqnTxqDFMF6f_GU0rJF66bmE',
});

/**
 * Upload a file buffer directly to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer memoryStorage
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadToCloudinary = (fileBuffer, folder = 'pritis_collection/products') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                format: 'webp',
                quality: 'auto',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    toString() { return result.secure_url; }
                });
            }
        );
        uploadStream.end(fileBuffer);
    });
};

/**
 * Delete an asset from Cloudinary by public ID
 * @param {string} publicId - The Cloudinary public_id (e.g. "pritis_collection/products/abc123")
 * @returns {Promise<any>}
 */
const deleteFromCloudinary = async (publicId) => {
    if (!publicId || typeof publicId !== 'string') return null;
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error(`[Cloudinary] Failed to destroy asset "${publicId}":`, error.message);
        throw error;
    }
};

/**
 * Robust fallback to extract Cloudinary public ID from a full Cloudinary URL
 * @param {string} url - Full Cloudinary image URL
 * @returns {string|null}
 */
const extractCloudinaryPublicId = (url) => {
    if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return null;
    try {
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        let pathAfterUpload = parts[1];
        const segments = pathAfterUpload.split('/');
        while (segments.length > 2 && !segments[0].match(/^v\d+$/)) {
            segments.shift();
        }
        if (segments[0] && segments[0].match(/^v\d+$/)) {
            segments.shift();
        }
        const fullPathWithExt = segments.join('/');
        return fullPathWithExt.replace(/\.[a-zA-Z0-9]+$/, '');
    } catch {
        return null;
    }
};

module.exports = {
    cloudinary,
    uploadToCloudinary,
    deleteFromCloudinary,
    extractCloudinaryPublicId,
};
