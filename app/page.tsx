import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { Process } from "@/components/landing/Process";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 font-sans">
      <Navbar />

      <main>
        <Hero />

        {/* Trusted By Section */}
        <div className="border-y border-white/5 bg-black/40 py-16 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-center text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase mb-12 opacity-70">
              Vertrouwd door innovatieve teams wereldwijd
            </p>
            <div className="grid grid-cols-2 gap-12 md:grid-cols-5 opacity-30 grayscale transition-all hover:grayscale-0 hover:opacity-100">
              {/* Placeholders for logos - using text for now but styled like logos */}
              {["Acme Corp", "GlobalBank", "Nebula", "Trio", "FoxRun"].map((logo) => (
                <div key={logo} className="flex items-center justify-center group cursor-pointer">
                  <span className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">{logo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Features />

        <Process />

        {/* CTA Section */}
        <section className="relative overflow-hidden py-40">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-soft-light"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/5 blur-[150px] rounded-full pointer-events-none" />

          <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center z-10">
            <h2 className="text-5xl font-medium tracking-tight text-white sm:text-6xl mb-8 leading-[1.1]">
              Klaar om je workflow te transformeren?
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-zinc-400 mb-12 font-light leading-relaxed">
              Sluit je aan bij duizenden ontwikkelaars en designers die de toekomst bouwen met Bonsai.
              Start vandaag nog je gratis proefperiode.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="/signup"
                className="group flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-medium text-black transition-all hover:bg-zinc-200 hover:scale-105"
              >
                Start nu gratis
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="/contact" className="text-base font-medium leading-6 text-zinc-400 hover:text-white transition-colors px-8 py-5">
                Neem contact op <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
