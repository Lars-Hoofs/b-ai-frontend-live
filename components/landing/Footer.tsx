"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Instagram, Send } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#050505] pt-32 pb-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600" />
                            <span className="text-xl font-bold text-white tracking-tight">Bonsai</span>
                        </div>
                        <p className="text-sm text-zinc-500 leading-relaxed max-w-xs font-light">
                            Empowering the next generation of digital builders with AI-driven tools and workflows.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white/[0.02] border border-white/5 text-zinc-500 transition-all hover:bg-white/10 hover:text-white hover:scale-110"
                                >
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-widest uppercase mb-8">Product</h3>
                        <ul className="space-y-4">
                            {["Functies", "Integraties", "Prijzen", "Changelog", "Documentatie"].map(
                                (item) => (
                                    <li key={item}>
                                        <Link
                                            href="#"
                                            className="text-sm text-zinc-500 transition-colors hover:text-orange-500 font-light"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-widest uppercase mb-8">Bedrijf</h3>
                        <ul className="space-y-4">
                            {["Over ons", "Blog", "Vacatures", "Contact", "Partners"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href="#"
                                        className="text-sm text-zinc-500 transition-colors hover:text-orange-500 font-light"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-widest uppercase mb-8">Blijf op de hoogte</h3>
                        <p className="text-sm text-zinc-500 mb-6 font-light">
                            Meld je aan voor onze nieuwsbrief voor de laatste updates en exclusieve aanbiedingen.
                        </p>
                        <form className="relative">
                            <input
                                type="email"
                                placeholder="Je e-mailadres"
                                className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1.5 rounded-lg bg-white p-2 text-black transition-colors hover:bg-zinc-200"
                            >
                                <Send className="h-3 w-3" />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-24 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-zinc-600 font-light">
                        &copy; {new Date().getFullYear()} Bonsai Inc. Alle rechten voorbehouden.
                    </p>
                    <div className="flex gap-8">
                        <Link href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-light">Privacybeleid</Link>
                        <Link href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-light">Algemene Voorwaarden</Link>
                        <Link href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-light">Cookiebeleid</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
