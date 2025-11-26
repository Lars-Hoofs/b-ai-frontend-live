"use client";

import { motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-4" : "py-8"}`}>
            <div className="mx-auto max-w-7xl px-6">
                <div className={`relative flex h-14 items-center justify-between rounded-full border border-white/5 bg-black/50 px-6 backdrop-blur-xl transition-all duration-500 ${scrolled ? "bg-black/80 shadow-2xl shadow-black/50" : ""}`}>

                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-gradient-to-br from-orange-500 to-red-600" />
                        <span className="text-lg font-bold text-white tracking-tight">Bonsai</span>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {["Product", "Oplossingen", "Prijzen", "Over ons"].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-white transition-colors hover:text-zinc-300"
                        >
                            Inloggen
                        </Link>
                        <Link
                            href="/signup"
                            className="group flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-all hover:bg-zinc-200"
                        >
                            Start gratis
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white p-1"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-24 left-6 right-6 rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 md:hidden shadow-2xl"
                >
                    <div className="flex flex-col gap-6">
                        {["Product", "Oplossingen", "Prijzen", "Over ons"].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-xl font-medium text-zinc-400 hover:text-white"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}
                        <div className="h-px bg-white/10 my-2" />
                        <Link href="/login" className="text-xl font-medium text-white">
                            Inloggen
                        </Link>
                        <Link
                            href="/signup"
                            className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-4 text-lg font-medium text-black"
                        >
                            Start gratis
                        </Link>
                    </div>
                </motion.div>
            )}
        </nav>
    );
}
