import { UploadCard } from '@/components/UploadCard';
import { VerifyCard } from '@/components/VerifyCard';

export default function Home() {
  return (
    <div className="flex flex-col min-h-full items-center justify-center p-8 max-w-7xl mx-auto w-full mt-10">
      <header className="text-center mb-16 max-w-3xl">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-6 drop-shadow-sm">
          Secure your files on the Blockchain
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed font-medium">
          ChainProof uses immutable blockchain technology to establish undeniable proof of existence and ownership for your digital assets.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        <div>
          <UploadCard />
        </div>
        <div>
          <VerifyCard />
        </div>
      </div>
    </div>
  );
}
