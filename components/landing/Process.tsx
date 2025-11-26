"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { UserPlus, Users, Bot, GitBranch, Plug, Code2 } from "lucide-react";

const steps = [
    {
        id: 1,
        title: "Aanmelden",
        description: "Start direct met een gratis account. Geen creditcard nodig.",
        icon: UserPlus,
    },
    {
        id: 2,
        title: "Team aanmaken",
        description: "Nodig je collega's uit en werk samen in een gedeelde omgeving.",
        icon: Users,
    },
    {
        id: 3,
        title: "Agent configureren",
        description: "Geef je AI-agent een persoonlijkheid en specifieke kennis.",
        icon: Bot,
    },
    {
        id: 4,
        title: "Flow bouwen",
        description: "Sleep en verbind blokken om complexe conversaties te automatiseren.",
        icon: GitBranch,
    },
    {
        id: 5,
        title: "Widget koppelen",
        description: "Pas de chat-widget aan zodat deze perfect bij je merk past.",
        icon: Plug,
    },
    {
        id: 6,
        title: "Integreren",
        description: "Kopieer de code en plaats deze op je website. Klaar in 2 minuten.",
        icon: Code2,
    },
];

export function Process() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    return (
        <section ref={containerRef} className="relative bg-[#050505] py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mb-24 max-w-2xl">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-base font-medium tracking-wide text-orange-500 uppercase"
                    >
                        Hoe het werkt
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl"
                    >
                        Van idee naar implementatie in zes stappen
                    </motion.p>
                </div>

                <div className="relative grid gap-16 lg:grid-cols-2">
                    {/* Sticky Left Side - Progress Line */}
                    <div className="hidden lg:block relative">
                        <div className="sticky top-32 overflow-hidden">
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/10" />
                            <motion.div
                                style={{ scaleY: scrollYProgress }}
                                className="absolute left-8 top-0 bottom-0 w-0.5 bg-orange-500 origin-top"
                            />

                            <div className="space-y-24 py-8">
                                {steps.map((step, index) => (
                                    <StepIndicator key={step.id} step={step} index={index} total={steps.length} currentProgress={scrollYProgress} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Cards */}
                    <div className="space-y-32 lg:pt-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
                                transition={{ duration: 0.7 }}
                                className="relative"
                            >
                                <div className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm transition-colors hover:bg-white/[0.04] hover:border-white/10">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-orange-500">
                                        <step.icon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm font-mono text-zinc-500">
                                                {step.id}
                                            </span>
                                            <h3 className="text-2xl font-semibold text-white">
                                                {step.title}
                                            </h3>
                                        </div>
                                        <p className="text-lg text-zinc-400 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function StepIndicator({ step, index, total, currentProgress }: { step: any, index: number, total: number, currentProgress: any }) {
    // Logic to highlight active step based on scroll progress could be added here for extra polish
    return (
        <div className="relative pl-24 opacity-20">
            <span className="absolute left-[27px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white" />
            <h4 className="text-3xl font-bold text-white">{step.title}</h4>
        </div>
    )
}
