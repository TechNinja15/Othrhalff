import { Ghost } from 'lucide-react';

export default function Loading() {
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <Ghost className="w-12 h-12 text-[#ff007f] animate-pulse drop-shadow-[0_0_15px_rgba(255,0,127,0.5)]" />
        <div className="absolute inset-0 w-12 h-12 rounded-full bg-[#ff007f]/10 blur-xl animate-ping" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#ff007f] animate-bounce [animation-delay:0ms]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#ff007f] animate-bounce [animation-delay:150ms]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#ff007f] animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
