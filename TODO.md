# Content Management Image Fix - TODO

## Phase 1: Fix MediaManagement Component ✓
- [x] Update MediaManagement to use `media_files` table instead of `site_media`
- [x] Fix storage bucket reference (use `content-media` instead of `site-media`)
- [x] Add proper file tracking with metadata
- [x] Link uploaded media to staff member
- [ ] Test upload functionality

## Phase 2: Enhance ContentManagement Component
- [x] Add "All Website Images" tab to ContentManagement
- [x] Fetch all images from posts table
- [x] Fetch all images from media_files table
- [x] Create unified image gallery view with grid layout
- [x] Add image filtering (by category, source, usage)
- [x] Add image editing functionality (title, category)
- [x] Add image replacement functionality
- [x] Add image deletion with cascade handling
- [x] Show which posts use each image
- [ ] Add bulk operations support (optional enhancement)

## Phase 3: Database Integration
- [x] Ensure all edits update the database correctly
- [x] Handle image replacement in posts
- [x] Handle cascade deletion (remove from posts when image deleted)
- [x] Update display_order when needed
- [x] Test RLS policies

## Phase 4: Testing
- [ ] Test image upload
- [ ] Test image editing
- [ ] Test image replacement
- [ ] Test image deletion
- [ ] Test filters and search
- [ ] Test bulk operations
- [ ] Verify database updates

## Current Status: Phase 1, 2, and 3 Complete - Ready for Testing

## Summary of Changes:
1. **Fixed MediaManagement.tsx**: Now uses correct `media_files` table and `content-media` storage bucket
2. **Created ContentManagement.tsx**: Main component with tabs for Posts and Images
3. **Created PostsManagement.tsx**: Complete post management with image upload/selection
4. **Created ImagesGallery.tsx**: Comprehensive image gallery showing ALL website images with:
   - View all images from posts and media library
   - Filter by category and source
   - Edit image details (title, category)
   - Replace images (updates all posts using that image)
   - Delete images (with cascade handling)
   - Preview images with usage information
   - Shows which posts use each image

## Key Features Implemented:
✅ Unified image management across the entire website
✅ Edit image metadata and it updates in the database
✅ Replace images and all posts using them get updated
✅ Delete images with proper cascade handling
✅ Filter and search capabilities
✅ Visual indicators for image usage
✅ Separate tabs for Posts and Images management
✅ Full CRUD operations on both posts and images
