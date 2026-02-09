import { supabase } from './src/integrations/supabase/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assets directory
const assetsDir = path.join(__dirname, 'src', 'assets');

// Image categories mapping based on filename patterns
const getCategoryFromFilename = (filename: string): string => {
  if (filename.startsWith('trip-')) return 'school_trip';
  if (filename.startsWith('sports-')) return 'sports';
  if (filename.startsWith('students-')) return 'students';
  if (filename.startsWith('gallery-')) return 'gallery';
  if (filename.startsWith('uniform-')) return 'general';
  if (filename.startsWith('req-')) return 'general';
  if (filename.includes('headmaster')) return 'general';
  return 'general';
};

// Get friendly title from filename
const getTitleFromFilename = (filename: string): string => {
  const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
  return nameWithoutExt
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

async function uploadAssetsToDatabase() {
  console.log('🚀 Starting asset upload to database...\n');

  try {
    // Read all files from assets directory
    const files = fs.readdirSync(assetsDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    console.log(`📁 Found ${imageFiles.length} image files in assets folder\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const filename of imageFiles) {
      try {
        const filePath = path.join(assetsDir, filename);
        const fileBuffer = fs.readFileSync(filePath);
        const category = getCategoryFromFilename(filename);
        const title = getTitleFromFilename(filename);

        console.log(`📤 Uploading: ${filename}`);
        console.log(`   Category: ${category}`);
        console.log(`   Title: ${title}`);

        // Upload to Supabase Storage
        const storagePath = `assets/${filename}`;
        const { error: uploadError } = await supabase.storage
          .from('content-media')
          .upload(storagePath, fileBuffer, {
            contentType: `image/${path.extname(filename).slice(1)}`,
            upsert: true
          });

        if (uploadError) {
          console.error(`   ❌ Storage upload failed: ${uploadError.message}`);
          errorCount++;
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('content-media')
          .getPublicUrl(storagePath);

        console.log(`   ✅ Uploaded to storage: ${publicUrl}`);

        // Insert into media_files table
        const { error: dbError } = await supabase
          .from('media_files')
          .insert({
            file_name: title,
            file_url: publicUrl,
            file_type: 'image',
            file_size: fileBuffer.length,
          });

        if (dbError) {
          console.error(`   ❌ Database insert failed: ${dbError.message}`);
          errorCount++;
          continue;
        }

        console.log(`   ✅ Added to database\n`);
        successCount++;

      } catch (error: any) {
        console.error(`   ❌ Error processing ${filename}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Upload Complete!`);
    console.log(`   ✅ Success: ${successCount} files`);
    console.log(`   ❌ Errors: ${errorCount} files`);
    console.log('='.repeat(50));

  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the upload
uploadAssetsToDatabase();
