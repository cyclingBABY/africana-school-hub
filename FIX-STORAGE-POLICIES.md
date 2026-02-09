# Fix Storage Bucket Policies

The upload is failing due to Row Level Security (RLS) policies. Here's how to fix it:

## Option 1: Update Storage Policies (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **Storage** → Select `content-media` bucket
3. Click on **Policies** tab
4. Click **"New Policy"**
5. Choose **"For full customization"**
6. Create an INSERT policy:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: INSERT
   - **Target roles**: authenticated
   - **USING expression**: `true`
   - **WITH CHECK expression**: `true`
7. Click **"Save policy"**

## Option 2: Disable RLS Temporarily (Quick Fix)

1. Go to **Storage** → `content-media` bucket
2. Click **Policies** tab
3. Toggle **"Enable RLS"** to OFF
4. Run the upload: `npm run upload-assets`
5. After upload completes, toggle RLS back ON
6. Add proper policies as shown in Option 1

## Option 3: Use Service Role Key (Advanced)

If you have access to the service role key:

1. Create a `.env.local` file (don't commit this!)
2. Add: `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`
3. The script will automatically use it if available

## After Fixing

Run the upload again:
```bash
npm run upload-assets
```

You should see:
```
✅ Uploaded to storage
✅ Added to database
```

For each file.
