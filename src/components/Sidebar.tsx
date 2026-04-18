'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, UploadCloud, LayoutDashboard, History } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true },
    { name: 'Upload & Proof', icon: UploadCloud, active: false },
    { name: 'Verification Log', icon: History, active: false },
  ];

  return (
    <aside className="w-72 bg-white/5 dark:bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between h-screen p-6 transition-all">
      <div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-3 mb-12 drop-shadow-md"
        >
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
            <ShieldCheck size={28} className="text-indigo-400" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            ChainProof
          </span>
        </motion.div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item, idx) => (
            <motion.a 
              key={item.name}
              href="#" 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden group",
                item.active ? "text-white bg-indigo-500/10 border border-indigo-500/20" : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {item.active && (
                <motion.div 
                   layoutId="active-nav"
                   className="absolute left-0 top-0 w-1 h-full bg-indigo-500 rounded-r-full"
                />
              )}
              <item.icon size={20} className={cn("transition-colors", item.active ? "text-indigo-400" : "group-hover:text-indigo-300")} />
              <span className="font-medium">{item.name}</span>
            </motion.a>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {!mounted ? null : isConnected ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-mono text-gray-300">
                  {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                </span>
              </div>
            </div>
            <button 
              className="w-full py-2 text-sm font-semibold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200" 
              onClick={() => disconnect()}
            >
              Disconnect
            </button>
          </motion.div>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full relative group overflow-hidden rounded-2xl p-[1px]" 
            onClick={() => connect({ connector: injected() })}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
            <div className="px-4 py-3 relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 text-white font-semibold flex items-center justify-center gap-2 transition-all">
              Connect Wallet
            </div>
          </motion.button>
        )}
      </div>
    </aside>
  );
}
