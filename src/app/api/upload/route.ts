import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fileHash, walletAddress, txHash, contractAddress, fileName } = body;

        if (!fileHash || !walletAddress) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // 1. Get or Create user
        let { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('wallet_address', walletAddress)
            .single();

        if (!user && walletAddress) {
            const { data: newUser, error: createError } = await supabaseAdmin
                .from('users')
                .insert([{ wallet_address: walletAddress }])
                .select()
                .single();
            if (createError) throw new Error("Database Error (users): " + createError.message);
            user = newUser;
        }

        // 2. Log File
        const { error: fileError } = await supabaseAdmin
            .from('files')
            .upsert([{ 
                user_id: user?.id, 
                file_hash: fileHash, 
                file_name: fileName || 'unnamed'
            }], { onConflict: 'file_hash' });
            
        if (fileError) throw new Error("Database Error (files): " + fileError.message);

        // 3. Log Proof
        if (txHash && contractAddress) {
            const { error: proofError } = await supabaseAdmin
                .from('proofs')
                .insert([{ 
                    file_hash: fileHash, 
                    tx_hash: txHash, 
                    contract_address: contractAddress, 
                    verified: true 
                }]);
                
            if (proofError) throw new Error("Database Error (proofs): " + proofError.message);
        }

        // 4. Invalidate specific cache if caching is active
        await redis.set(`verify_${fileHash}`, JSON.stringify({ 
            verified: true, 
            txHash, 
            fileName: fileName || 'unnamed', 
            owner: walletAddress, 
            timestamp: Date.now() 
        }), 'EX', 3600);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}
