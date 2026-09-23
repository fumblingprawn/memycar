import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

    const userClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authErr } = await userClient.auth.getUser(token);

    if (authErr || !user) {
      return NextResponse.json({ error: 'User session invalid' }, { status: 401 });
    }

    const userEmail = user.email || '';
    const userId = user.id;

    // Use admin client with service role key to delete across tables and auth.users
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    await adminClient.from('listings').delete().eq('user_id', userId);
    await adminClient.from('saved_listings').delete().eq('user_id', userId);
    await adminClient.from('profiles').delete().eq('id', userId);
    
    // Delete user from auth.users
    const { error: deleteUserErr } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteUserErr) {
      // Fallback: If service role key is not set in env, invoke the DB RPC function
      const { error: rpcErr } = await userClient.rpc('delete_user_account');
      if (rpcErr) throw rpcErr;
    }

    console.log(`[Account Deleted] User ${userId} (${userEmail}) removed successfully.`);

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (err: any) {
    console.error('Account deletion error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
