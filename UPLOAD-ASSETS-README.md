# Upload Assets to Database

This script uploads all images from the `src/assets` folder to your Supabase database, making them manageable through the admin panel.

## Prerequisites

### 1. Create the Storage Bucket

You need to manually create the `content-media` bucket in Supabase Dashboard:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Configure the bucket:
   - **Name**: `content-media`
   - **Public bucket**: ✅ Yes (check this box)
   - **File size limit**: 50 MB (52428800 bytes)
   - **Allowed MIME types**: Leave empty or add:
     - image/jpeg
     - image/png
     - image/gif
     - image/webp
     - video/mp4
     - video/webm
6. Click **"Create bucket"**

### 2. Environment Variables

Make sure your `.env` file contains:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## How to Run

Simply run the following command:

```bash
npm run upload-assets
```

## What It Does

1. **Scans** the `src/assets` folder for all image files (jpg, jpeg, png, gif, webp)
2. **Uploads** each image to Supabase Storage in the `content-media` bucket under `assets/` folder
3. **Categorizes** images automatically based on filename:
   - `trip-*.jpg` → school_trip
   - `sports-*.jpg` → sports
   - `students-*.jpg` → students
   - `gallery-*.jpg` → gallery
   - Others → general
4. **Creates** database records in the `media_files` table
5. **Skips** files that already exist (won't duplicate)

## After Upload

Once uploaded, you can:
- View all images in Admin Panel → Content Management → "All Website Images" tab
- Edit image titles and categories
- Replace images (updates all posts using them)
- Delete images
- Use images in new posts

## Example Output

```
🚀 Starting asset upload to database...

📁 Found 29 image files in assets folder

📤 Processing: trip-1.jpg
   Category: school_trip
   Title: Trip 1
   ✅ Uploaded to storage
   ✅ Added to database

📤 Processing: sports-1.jpg
   Category: sports
   Title: Sports 1
   ✅ Uploaded to storage
   ✅ Added to database

...

============================================================
✨ Upload Complete!
   ✅ Successfully uploaded: 29 files
   ⏭️  Skipped (already exists): 0 files
   ❌ Errors: 0 files
   📊 Total processed: 29 files
============================================================
```

## Troubleshooting

**Error: Missing Supabase credentials**
- Check your `.env` file has the correct variables

**Error: Storage upload failed**
- Ensure the `content-media` bucket exists in Supabase
- Check bucket permissions allow uploads

**Error: Database insert failed**
- Verify the `media_files` table exists
- Check RLS policies allow inserts
