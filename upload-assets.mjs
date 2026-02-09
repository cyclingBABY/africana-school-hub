import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Assets directory
const assetsDir = path.join(__dirname, 'src', 'assets');

// Image categories mapping based on filename patterns
const getCategoryFromFilename = (filename) => {
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
const getTitleFromFilename = (filename) => {
  const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
  return nameWithoutExt
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

async function uploadAssetsToDatabase() {
  console.log('🚀 Starting asset upload to database...\n');
  console.log(`📂 Supabase URL: ${supabaseUrl}\n`);

  try {
    // Read all files from assets directory
    const files = fs.readdirSync(assetsDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    console.log(`📁 Found ${imageFiles.length} image files in assets folder\n`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const filename of imageFiles) {
      try {
        const filePath = path.join(assetsDir, filename);
        const fileBuffer = fs.readFileSync(filePath);
        const category = getCategoryFromFilename(filename);
        const title = getTitleFromFilename(filename);

        console.log(`📤 Processing: ${filename}`);
        console.log(`   Category: ${category}`);
        console.log(`   Title: ${title}`);

        // Upload to Supabase Storage
        const storagePath = `assets/${filename}`;
        
        // Check if file already exists
        const { data: existingFiles } = await supabase.storage
          .from('content-media')
          .list('assets', {
            search: filename
          });

        if (existingFiles && existingFiles.length > 0) {
          console.log(`   ⏭️  File already exists in storage, skipping upload`);
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('content-media')
            .getPublicUrl(storagePath);

          // Check if already in database
          const { data: existingRecord } = await supabase
            .from('media_files')
            .select('id')
            .eq('file_url', publicUrl)
            .single();

          if (existingRecord) {
            console.log(`   ⏭️  Already in database, skipping\n`);
            skippedCount++;
            continue;
          }

          // Add to database if not there
          const { error: dbError } = await supabase
            .from('media_files')
            .insert({
              file_name: title,
              file_url: publicUrl,
              file_type: 'image',
              file_size: fileBuffer.length,
            });

          if (dbError) {
            console.error(`   ❌ Database insert failed: ${dbError.message}\n`);
            errorCount++;
            continue;
          }

          console.log(`   ✅ Added to database\n`);
          successCount++;
          continue;
        }

        // Upload new file
        const { error: uploadError } = await supabase.storage
          .from('content-media')
          .upload(storagePath, fileBuffer, {
            contentType: `image/${path.extname(filename).slice(1).toLowerCase()}`,
            upsert: false
          });

        if (uploadError) {
          console.error(`   ❌ Storage upload failed: ${uploadError.message}\n`);
          errorCount++;
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('content-media')
          .getPublicUrl(storagePath);

        console.log(`   ✅ Uploaded to storage`);

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
          console.error(`   ❌ Database insert failed: ${dbError.message}\n`);
          errorCount++;
          continue;
        }

        console.log(`   ✅ Added to database\n`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Error processing ${filename}:`, error.message, '\n');
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✨ Upload Complete!`);
    console.log(`   ✅ Successfully uploaded: ${successCount} files`);
    console.log(`   ⏭️  Skipped (already exists): ${skippedCount} files`);
    console.log(`   ❌ Errors: ${errorCount} files`);
    console.log(`   📊 Total processed: ${imageFiles.length} files`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the upload
uploadAssetsToDatabase();
