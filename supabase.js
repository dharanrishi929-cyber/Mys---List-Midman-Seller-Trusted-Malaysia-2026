const SUPABASE_URL =
    "https://qdqufbltfxldrsbubgzl.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_ZI-GkTzVixx2hadtYNLLUg_nqSNNtXM";

window.supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

console.log(
    "SUPABASE CLIENT READY:",
    window.supabaseClient
);
