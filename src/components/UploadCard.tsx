'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, File as FileIcon, CheckCircle, Loader2 } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import DocumentProofJSON from '@/lib/DocumentProof.json';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const CONTRACT_ADDRESS = '0x0383a3559d646645EBdd75cA391eaA82F8957850'; // Deployed to Sepolia Testnet

export function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string>('');
  const [isHashing, setIsHashing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { data: txHashWagmi, isPending, writeContractAsync } = useWriteContract();
  
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHashWagmi,
  });

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovered(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelection = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsHashing(true);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setHash(`0x${hashHex}`);
    } catch (error) {
      console.error('Error generating hash:', error);
    } finally {
      setIsHashing(false);
    }
  };

  const storeOnChain = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    
    try {
      setIsUploading(true);
      
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: DocumentProofJSON.abi,
        functionName: 'storeProof',
        args: [hash],
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileHash: hash,
          walletAddress: address,
          txHash: tx,
          contractAddress: CONTRACT_ADDRESS,
          fileName: file?.name
        }),
      });

      if (!res.ok) throw new Error("Failed to log upload on backend");
      
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error && err.message.includes('User rejected')) {
        alert("Transaction was rejected.");
      } else {
        alert("Upload failed or proof already exists.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
      
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">Upload & Secure</h2>
      <p className="text-gray-400 mb-8">Drag and drop a file to generate its cryptographic proof on-chain.</p>

      <motion.div 
        className={cn(
          "relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl transition-all duration-300",
          isHovered ? "border-indigo-400 bg-indigo-500/10 scale-[1.02]" : "border-white/20 bg-white/5 hover:border-white/30"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsHovered(true); }}
        onDragLeave={() => setIsHovered(false)}
        onDrop={handleDrop}
      >
        <motion.div 
          animate={isHovered ? { y: -5 } : { y: 0 }}
          className="p-4 bg-indigo-500/10 rounded-full mb-4"
        >
          <UploadCloud size={32} className="text-indigo-400" />
        </motion.div>
        <p className="text-gray-300 font-medium">Drop your file here, or <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer">browse</span></p>
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])}
        />
      </motion.div>

      <AnimatePresence>
        {file && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="flex flex-col gap-4 overflow-hidden"
          >
            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <FileIcon size={24} className="text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white">{file.name}</span>
                <span className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</span>
              </div>
            </div>
            
            <div className="p-4 bg-black/30 border border-white/5 rounded-2xl">
              <span className="block text-xs font-semibold text-gray-400 uppercase mb-2">SHA-256 Hash</span>
              {isHashing ? (
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-sm">
                  <Loader2 size={16} className="animate-spin" /> Generating...
                </div>
              ) : (
                <span className="font-mono text-sm text-white break-all">{hash}</span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!isTxSuccess ? (
                <motion.button 
                  key="store-btn"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="relative group w-full p-[1px] rounded-2xl overflow-hidden mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isHashing || isUploading || isPending || isTxConfirming || !hash}
                  onClick={storeOnChain}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-black/50 backdrop-blur-md px-6 py-4 rounded-2xl flex items-center justify-center gap-2 text-white font-semibold transition-all group-hover:bg-black/30">
                    {(isUploading || isPending || isTxConfirming) ? (
                      <><Loader2 size={20} className="animate-spin" /> Processing Blockchain TX...</>
                    ) : (
                      'Store Proof on Blockchain'
                    )}
                  </div>
                </motion.button>
              ) : (
                <motion.div 
                  key="success-msg"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl mt-4 font-medium"
                >
                  <CheckCircle size={22} />
                  <span>Proof Stored Successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
