import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://pnzqktwmycllrygppjnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuenFrdHdteWNsbHJ5Z3Bwam53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTQ1NDcsImV4cCI6MjA2NzIzMDU0N30.Iv8X6Ko_VK-TXPYWNvkJ0xZ6jH8ahmuk0j6Xy-uly_I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}