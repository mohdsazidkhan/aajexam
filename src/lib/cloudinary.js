import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImage = async (imagePath, folder = 'aajexam') => {
    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: folder,
            resource_type: 'auto'
        });
        return result;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw error;
    }
};

export default cloudinary;

