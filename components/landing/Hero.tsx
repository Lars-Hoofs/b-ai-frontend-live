"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, TrendingUp, Zap, Shield, Globe } from "lucide-react";

export function Hero() {
    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505] pt-32 pb-20 text-center selection:bg-orange-500/30">
            {/* Abstract Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[150px] rounded-full" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-soft-light"></div>

            <div className="relative z-10 mx-auto max-w-5xl px-6">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mx-auto mb-10 flex w-fit items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-5 py-2 backdrop-blur-md"
                >
                    <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    <span className="text-xs font-medium text-zinc-400 tracking-widest uppercase">
                        Bonsai 2.0 is live
                    </span>
                </motion.div>

                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="mb-8 text-5xl font-medium tracking-tight text-white md:text-7xl lg:text-8xl leading-[1.1]"
                >
                    Van idee naar <br />
                    <span className="text-zinc-500">
                        realiteit, direct.
                    </span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="mx-auto mb-12 max-w-2xl text-lg text-zinc-400 md:text-xl leading-relaxed font-light"
                >
                    Het complete platform voor AI-gestuurde workflows.
                    Bouw, beheer en schaal je digitale processen met ongekende snelheid en precisie.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="flex flex-col items-center justify-center gap-6 sm:flex-row"
                >
                    <button className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-medium text-black transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95">
                        Start gratis
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button className="group flex items-center gap-3 rounded-full text-sm font-medium text-zinc-400 transition-all hover:text-white">
                        <Play className="h-4 w-4 fill-current" />
                        Bekijk demo
                    </button>
                </motion.div>

                {/* Abstract Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-24 relative mx-auto w-full max-w-6xl"
                >
                    <div className="relative rounded-2xl border border-white/5 bg-[#0A0A0A] shadow-2xl overflow-hidden aspect-[16/9]">
                        {/* Minimal UI Header */}
                        <div className="absolute top-0 left-0 right-0 h-12 border-b border-white/5 bg-white/[0.02] flex items-center px-6 gap-4">
                            <div className="flex gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                                <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                                <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                            </div>
                        </div>

                        {/* Abstract Content */}
                        <div className="absolute inset-0 pt-12 flex items-center justify-center">
                            <div className="w-3/4 h-3/4 grid grid-cols-2 gap-8">
                                {/* Left Block */}
                                <div className="space-y-6">
                                    <div className="h-32 w-full rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5" />
                                    <div className="h-24 w-full rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5" />
                                </div>
                                {/* Right Block */}
                                <div className="space-y-6 pt-12">
                                    <div className="h-24 w-full rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20" />
                                    <div className="h-32 w-full rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5" />
                                </div>
                            </div>
                        </div>

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

