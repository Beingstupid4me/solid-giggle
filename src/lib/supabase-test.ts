/**
 * Supabase Connection Test
 * 
 * Run this in browser console to verify Supabase client is properly initialized
 * 
 * Example:
 * import { testSupabaseConnection } from '@/lib/supabase-test';
 * await testSupabaseConnection();
 */

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_ANON_KEY;

  console.log('📋 Environment Variables:');
  console.log('  URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('  Anon Key:', supabaseKey ? '✅ Set' : '❌ Missing');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables. Check .env file');
    return;
  }

  // Try to import and test Supabase client
  try {
    const { supabase } = await import('@/lib/supabase');
    console.log('\n✅ Supabase client imported successfully');

    // Test auth session
    console.log('\n🔐 Testing Auth Session:');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('  ❌ Error:', sessionError.message);
    } else if (session) {
      console.log('  ✅ User logged in:', session.user.email);
    } else {
      console.log('  ℹ️  No active session (expected if not logged in)');
    }

    // Test simple query
    console.log('\n📊 Testing Database Query:');
    const { data, error: queryError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (queryError) {
      console.error('  ❌ Query failed:', queryError.message);
      console.error('     Hint:', queryError.hint);
      console.error('     Details:', queryError.details);
    } else {
      console.log('  ✅ Query successful');
      console.log('  Returned rows:', data?.length || 0);
    }

    console.log('\n✅ All tests completed');
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Auto-run on import (optional)
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
  console.log('💡 Supabase test available: testSupabaseConnection()');
}
