"use client";

import { motion } from "framer-motion";
import { Bot, Globe, Layers, Shield, Zap, Database, Cpu, Network } from "lucide-react";

export function Features() {
    return (
        <section id="features" className="relative bg-[#050505] py-32 overflow-hidden">
            {/* Background Noise */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-soft-light"></div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl text-center mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-base font-medium tracking-wide text-orange-500 uppercase"
                    >
                        Mogelijkheden
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl"
                    >
                        Alles wat je nodig hebt om te schalen
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[minmax(250px,auto)]">
                    {/* Main Feature Card - The "Grow" Visualization */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0A0A0A] p-10 group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-orange-500 border border-white/10">
                                    <Network className="h-6 w-6" />
                                </div>
                                <h3 className="text-3xl font-medium text-white mb-3">Gecentraliseerde Intelligentie</h3>
                                <p className="text-zinc-400 max-w-md text-lg font-light">Verbind al je databronnen in één uniforme intelligentielaag voor maximale efficiëntie.</p>
                            </div>

                            {/* Radial Visualization */}
                            <div className="relative h-[350px] w-full flex items-center justify-center mt-12">
                                {/* Center Node */}
                                <div className="relative z-20 h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.2)]">
                                    <Database className="h-8 w-8 text-white" />
                                </div>

                                {/* Orbiting Nodes */}
                                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute"
                                        initial={{ rotate: deg }}
                                        animate={{ rotate: deg + 360 }}
                                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/5" />
                                        <motion.div
                                            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-[#111] border border-white/10 flex items-center justify-center z-10 shadow-lg"
                                            style={{ transformOrigin: "50% 170px" }} // Approximate radius
                                        >
                                            <div className="h-2 w-2 rounded-full bg-zinc-600" />
                                        </motion.div>
                                    </motion.div>
                                ))}

                                {/* Connecting Lines */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                                    <circle cx="50%" cy="50%" r="140" fill="none" stroke="currentColor" strokeWidth="1" className="text-white" strokeDasharray="4 4" />
                                    <circle cx="50%" cy="50%" r="85" fill="none" stroke="currentColor" strokeWidth="1" className="text-white" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    {/* Secondary Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-1 md:row-span-1 relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0A0A0A] p-10 group hover:border-white/10 transition-colors"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative z-10">
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-blue-500 border border-white/10">
                                <Cpu className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-3">Neurale Verwerking</h3>
                            <p className="text-base text-zinc-400 font-light">Geavanceerde algoritmes die zich aanpassen aan jouw workflow.</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-1 md:row-span-1 relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0A0A0A] p-10 group hover:border-white/10 transition-colors"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative z-10">
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-green-500 border border-white/10">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-3">Zero Trust</h3>
                            <p className="text-base text-zinc-400 font-light">Beveiliging ingebakken in elke laag van de stack.</p>
                        </div>
                    </motion.div>

                    {/* Wide Bottom Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-3 relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0A0A0A] p-10 group hover:border-white/10 transition-colors"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="max-w-xl">
                                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-purple-500 border border-white/10">
                                    <Layers className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-medium text-white mb-3">Naadloze Integratie</h3>
                                <p className="text-zinc-400 text-lg font-light">Werkt met je bestaande stack. Geen complete rewrite nodig. Drop onze SDK en begin met bouwen.</p>
                            </div>
                            <div className="flex gap-6 opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                {/* Tech Logos Placeholders - Abstract Shapes */}
                                <div className="h-12 w-12 rounded-xl bg-white/10 rotate-3" />
                                <div className="h-12 w-12 rounded-xl bg-white/10 -rotate-2" />
                                <div className="h-12 w-12 rounded-xl bg-white/10 rotate-6" />
                                <div className="h-12 w-12 rounded-xl bg-white/10 -rotate-3" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

