const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing-key';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Connecting to:", supabaseUrl);
    
    // GET ALL FILES
    const { data: files, error: filesError } = await supabaseAdmin
        .from('files')
        .select('*');
        
    if (filesError) {
        console.error("ERROR FETCHING FILES:", filesError);
    } else {
        console.log("=== FILES IN DB ===");
        console.log(JSON.stringify(files, null, 2));
    }

    // TEST EXACT VERIFY QUERY
    const hash = "0x8a94b8128d53472428ac046c59d4a0513156a99940c7c4c7c718acf89f4b7ca2";
    
    const { data: proof, error } = await supabaseAdmin
        .from('proofs')
        .select(`
            tx_hash,
            contract_address,
            verified,
            files(file_name, users(wallet_address))
        `)
        .eq('file_hash', hash)
        .single();

    if (error) {
        console.error("EXPECTED ERROR IN API ROUTE:", error);
    } else {
        console.log("Found proof:", JSON.stringify(proof, null, 2));
    }
}

test();
