"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { motion } from "framer-motion";
import { RiArrowLeftLine } from "@remixicon/react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const token = searchParams.get("token");

  // Functie die Unicorn Studio start zodra het script veilig geladen is
  const handleScriptLoad = () => {
    if (typeof window !== "undefined" && (window as any).UnicornStudio) {
      (window as any).UnicornStudio.init();
    }
  };

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Ongeldige of ontbrekende verificatielink.");
      return;
    }

    const verify = async () => {
      setStatus("loading");
      setMessage("Bezig met verifiëren van je e-mailadres...");

      try {
        // Better Auth backend route – pas eventueel aan naar jouw exacte endpoint
        await apiRequest("/api/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });

        setStatus("success");
        setMessage("Je e-mailadres is succesvol geverifieerd! Je kunt nu inloggen.");
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err?.message ||
            "Er is iets misgegaan bij het verifiëren van je e-mailadres. Probeer het later opnieuw."
        );
      }
    };

    verify();
  }, [token]);

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Unicorn Studio script */}
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
            transform: "translateZ(0)",
            willChange: "transform",
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
        transition={{ duration: 0.4 }}
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
            E-mail verificatie
          </h1>
          <p className="text-zinc-400 text-sm drop-shadow-md">
            We zijn bezig met het bevestigen van je e-mailadres.
          </p>
        </div>

        {/* Status card */}
        <div className="px-2 sm:px-0">
          <div
            className={`rounded-xl border bg-zinc-900/90 backdrop-blur-sm px-4 py-4 shadow-lg text-sm text-center ${
              status === "success"
                ? "border-green-500/40 text-green-400"
                : status === "error"
                ? "border-red-500/40 text-red-400"
                : "border-white/10 text-zinc-300"
            }`}
          >
            {isLoading && (
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="inline-block w-3 h-3 rounded-full border-2 border-dashed border-zinc-400 animate-spin" />
                <span>Even geduld...</span>
              </div>
            )}
            <p>{message}</p>
          </div>

          {/* CTA knoppen */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-xl"
            >
              Naar login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-zinc-900/80 text-zinc-200 text-sm font-semibold border border-white/10 hover:bg-zinc-800 transition-colors backdrop-blur-sm"
            >
              Nieuw account maken
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
