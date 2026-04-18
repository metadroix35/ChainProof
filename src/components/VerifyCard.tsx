'use client';

import { useState } from 'react';
import { Search, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function VerifyCard() {
  const [hash, setHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;

    setIsVerifying(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/verify?hash=${encodeURIComponent(hash.trim())}&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setResult(data.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 relative overflow-hidden h-fit"
    >
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">Verify File</h2>
      <p className="text-gray-400 mb-8">Check if a document&apos;s hash exists on the blockchain.</p>

      <form onSubmit={handleVerify} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
        </div>
        <input
          type="text"
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-32 text-white placeholder-gray-500 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all font-mono text-sm"
          placeholder="Enter SHA-256 Hash (0x...)"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
        />
        <div className="absolute inset-y-2 right-2">
          <button 
            type="submit" 
            className="h-full px-6 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isVerifying || !hash.trim()}
          >
            {isVerifying ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
          </button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mt-6 flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500"
          >
            <ShieldAlert size={24} className="shrink-0" />
            <div className="flex flex-col">
              <strong className="font-semibold">Verification Failed</strong>
              <span className="text-red-400/80 text-sm mt-1">{error}</span>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mt-6 flex flex-col overflow-hidden"
          >
            <div className={cn(
              "flex items-center gap-3 p-4 rounded-t-2xl border border-b-0",
              result.verified ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
            )}>
              {result.verified ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
              <span className="font-semibold text-lg">{result.verified ? 'Authentic Document' : 'Unverified Document'}</span>
            </div>
            
            <div className="bg-black/30 border border-white/5 rounded-b-2xl p-6 flex flex-col gap-6">
              <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">File Name</span>
                <span className="text-white font-medium">{(result.fileName as string) || 'Unknown'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Owner Address</span>
                <span className="text-white font-mono text-sm">{(result.owner as string) || 'Unknown'}</span>
              </div>
              {Boolean(result.txHash) && (
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Transaction Hash</span>
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
                    target="_blank" rel="noreferrer"
                    className="text-purple-400 hover:text-purple-300 font-mono text-sm break-all transition-colors underline decoration-purple-500/30 underline-offset-4"
                  >
                    {result.txHash as string}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
