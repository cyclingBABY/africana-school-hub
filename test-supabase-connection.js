// Test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('Configuration:');
console.log('- URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('- Key:', SUPABASE_KEY ? '✅ Set' : '❌ Missing');
console.log('');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  try {
    // Test 1: Check if we can connect
    console.log('Test 1: Testing basic connection...');
    const { data, error } = await supabase.from('staff_members').select('count');
    
    if (error) {
      console.log('❌ Connection test failed:', error.message);
      return false;
    }
    console.log('✅ Successfully connected to Supabase!\n');

    // Test 2: Check tables exist
    console.log('Test 2: Checking database tables...');
    const tables = ['applications', 'staff_members', 'application_notes'];
    
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('count').limit(1);
      if (tableError) {
        console.log(`❌ Table "${table}" error:`, tableError.message);
      } else {
        console.log(`✅ Table "${table}" exists`);
      }
    }
    console.log('');

    // Test 3: Check storage bucket
    console.log('Test 3: Checking storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Storage check failed:', bucketError.message);
    } else {
      const appDocsBucket = buckets.find(b => b.name === 'application-documents');
      if (appDocsBucket) {
        console.log('✅ Storage bucket "application-documents" exists');
      } else {
        console.log('⚠️  Storage bucket "application-documents" not found');
        console.log('Available buckets:', buckets.map(b => b.name).join(', '));
      }
    }
    console.log('');

    // Test 4: Test authentication (sign in with super admin)
    console.log('Test 4: Testing Super Admin authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'africanamuslim_code5_creations@gmail.com',
      password: 'admin.africana.2026',
    });

    if (authError) {
      console.log('❌ Super Admin login failed:', authError.message);
      console.log('⚠️  Note: You may need to create this user in Supabase Auth first');
    } else {
      console.log('✅ Super Admin login successful!');
      console.log('   User ID:', authData.user.id);
      console.log('   Email:', authData.user.email);
      
      // Check if staff member record exists
      const { data: staffData, error: staffError } = await supabase
        .from('staff_members')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
      
      if (staffError) {
        console.log('⚠️  Staff member record not found - will be created on first login');
      } else {
        console.log('✅ Staff member record exists');
        console.log('   Role:', staffData.role);
        console.log('   Status:', staffData.status);
      }
      
      // Sign out
      await supabase.auth.signOut();
    }
    console.log('');

    console.log('🎉 All tests completed!\n');
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
