import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://pnzqktwmycllrygppjnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuenFrdHdteWNsbHJ5Z3Bwam53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTQ1NDcsImV4cCI6MjA2NzIzMDU0N30.Iv8X6Ko_VK-TXPYWNvkJ0xZ6jH8ahmuk0j6Xy-uly_I'; // Asegurate que sea la clave pública "anon"
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 
