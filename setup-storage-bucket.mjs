import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorageBucket() {
  console.log('🚀 Setting up storage bucket...\n');

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      process.exit(1);
    }

    const bucketExists = buckets?.some(b => b.name === 'content-media');

    if (bucketExists) {
      console.log('✅ Bucket "content-media" already exists!');
      console.log('   You can now run: npm run upload-assets\n');
      return;
    }

    console.log('📦 Creating "content-media" bucket...');

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('content-media', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime'
      ]
    });

    if (error) {
      console.error('❌ Error creating bucket:', error.message);
      console.log('\n⚠️  You may need to create the bucket manually in Supabase Dashboard:');
      console.log('   1. Go to Storage in Supabase Dashboard');
      console.log('   2. Click "New bucket"');
      console.log('   3. Name it "content-media"');
      console.log('   4. Make it public');
      console.log('   5. Set file size limit to 50MB');
      process.exit(1);
    }

    console.log('✅ Bucket "content-media" created successfully!');
    console.log('   You can now run: npm run upload-assets\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

setupStorageBucket();
