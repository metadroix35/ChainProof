import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { redis } from '@/lib/redis';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const hash = url.searchParams.get('hash');

    if (!hash) {
        return NextResponse.json({ error: 'Hash parameter is required' }, { status: 400 });
    }

    try {
        // 1. Check Redis Cache
        const cached = await redis.get(`verify_${hash}`);
        if (cached) {
            return NextResponse.json({ source: 'cache', data: JSON.parse(cached) });
        }

        // 2. Check Supabase
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

        if (error && error.code !== 'PGRST116') {
             return NextResponse.json({ error: 'DB Error: ' + error.message, details: error }, { status: 500 });
        }

        if (!proof) {
            return NextResponse.json({ error: 'Proof not found' }, { status: 404 });
        }

        const result = {
            verified: proof.verified,
            txHash: proof.tx_hash,
            contractAddress: proof.contract_address,
            fileName: (proof as any).files?.file_name || (Array.isArray((proof as any).files) ? (proof as any).files[0]?.file_name : undefined),
            owner: (proof as any).files?.users?.wallet_address || (Array.isArray((proof as any).files) ? (proof as any).files[0]?.users?.wallet_address : undefined),
        };

        // Cache result for 1 hour
        await redis.set(`verify_${hash}`, JSON.stringify(result), 'EX', 3600);

        return NextResponse.json({ source: 'database', data: result });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}
