import { v2 as cloudinary } from 'cloudinary';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

const isConfigured = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

if (isConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

// Sube un buffer de imagen a Cloudinary y devuelve la URL segura.
const uploadImageBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    if (!isConfigured) {
      return reject(new Error('Cloudinary no está configurado (faltan CLOUDINARY_* en .env)'));
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'arte-aniba/products', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });

export { uploadImageBuffer, isConfigured };
