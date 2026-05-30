process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { v2: cloudinary } = require('cloudinary');
const path = require('path');
const fs = require('fs');

cloudinary.config({
  cloud_name: 'ddoloafbp',
  api_key:    '811795714155685',
  api_secret: 'rOzh4bUMFi3BAySzqSytFeG6ucs',
});

async function main() {
  console.log('Checking Cloudinary connection...');

  // Test 1: ping via account info
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Ping OK:', result.status);
  } catch (e) {
    console.error('❌ Ping failed:', e.message);
    process.exit(1);
  }

  // Test 2: try uploading a small test image
  const testImg = path.join(__dirname, '../../frontend/public/products/emin-nvr-2104h.jpg');
  if (fs.existsSync(testImg)) {
    try {
      const r = await cloudinary.uploader.upload(testImg, {
        public_id: 'technics/_test_connection',
        overwrite: true,
        resource_type: 'image',
      });
      console.log('✅ Upload OK:', r.secure_url);
      await cloudinary.uploader.destroy('technics/_test_connection');
      console.log('✅ Delete OK');
    } catch (e) {
      console.error('❌ Upload failed:', e.message);
    }
  }
}

main();
