'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script'; // Import Next.js Script
import { motion } from 'framer-motion';
import { RiArrowLeftLine } from '@remixicon/react';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Functie die wordt aangeroepen zodra het script volledig geladen is
  const handleScriptLoad = () => {
    if ((window as any).UnicornStudio) {
      (window as any).UnicornStudio.init();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens bevatten');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registratie mislukt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white flex flex-col items-center justify-center relative overflow-hidden p-4">
      
      {/* OPTIMALISATIE: Next.js Script Component */}
      {/* lazyOnload zorgt dat dit pas laadt als de browser 'idle' is, wat lag voorkomt */}
      <Script 
        src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.35/dist/unicornStudio.umd.js"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />

      {/* Unicorn Studio Achtergrond Layer */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div 
          data-us-project="Y1zElGgk9In0vRwQ4ROW" 
          className="w-full h-full scale-[1.3] origin-center"
          style={{ 
            opacity: 0.6,
            // Hardware acceleratie forceren voor soepelere rendering
            transform: 'translateZ(0)', 
            willChange: 'transform' 
          }} 
        ></div> 
      </div>

      {/* Terug Knop */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/5 hover:bg-black/40"
        >
          <RiArrowLeftLine size={16} />
          Terug
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }} // Iets snellere animatie voelt 'snappier'
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-zinc-900/80 backdrop-blur-md rounded-xl flex items-center justify-center border border-zinc-700 shadow-2xl">
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-zinc-400 animate-spin-slow" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2 tracking-tight drop-shadow-lg">
            Account aanmaken
          </h1>
          <p className="text-zinc-400 text-sm drop-shadow-md">
            Vul je gegevens in om te beginnen.{' '}
            <Link href="/login" className="text-white font-medium hover:underline">
              Al een account? Log in
            </Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-2 sm:px-0">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all shadow-lg"
              placeholder="Volledige naam"
            />
          </div>

          <div className="space-y-1">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all shadow-lg"
              placeholder="Je e-mailadres"
            />
          </div>

          <div className="space-y-1">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all shadow-lg"
              placeholder="Wachtwoord"
            />
          </div>

          <div className="space-y-1">
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all shadow-lg"
              placeholder="Bevestig wachtwoord"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-xl"
          >
            {loading ? 'Account aanmaken...' : 'Account aanmaken'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed drop-shadow-sm mix-blend-plus-lighter">
            Door een account aan te maken ga je akkoord met onze{' '}
            <Link href="/terms" className="underline hover:text-zinc-300">Algemene Voorwaarden</Link>
            {' '}en ons{' '}
            <Link href="/privacy" className="underline hover:text-zinc-300">Privacybeleid</Link>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}