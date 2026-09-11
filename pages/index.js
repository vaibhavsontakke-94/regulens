import { Fragment } from "react";
import Link from "next/link";
import Head from "next/head";
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  BookOpenCheck,
  Check,
  ChevronRight,
  ChevronDown,
  Cpu,
  FileCheck2,
  FileSearch2,
  Gauge,
  Landmark,
  Layers,
  MapPinned,
  Play,
  ScrollText,
  Scale,
  ShieldCheck,
  Target,
  TriangleAlert,
  Users,
  Zap,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SectionHeading from "@/components/ui/SectionHeading";
import FeatureCard from "@/components/ui/FeatureCard";
import ProcessStep from "@/components/ui/ProcessStep";
import RoleCard from "@/components/RoleCard";
import HeroPreview from "@/components/HeroPreview";
import EcosystemDiagram, { MobileEcosystem } from "@/components/EcosystemDiagram";

const ROLE_CARDS = [
  {
    badge: "Government",
    badgeVariant: "blue",
    icon: Landmark,
    highlight: true,
    title: "Government Intelligence",
    description:
      "Analyze regulatory impacts, identify affected businesses, evaluate policies and monitor implementation using evidence-backed intelligence.",
    features: [
      "Regulation Impact Analysis",
      "Business Impact Assessment",
      "Policy Intelligence",
      "Ground Verification",
      "Solution Tracking",
    ],
    cta: "Continue as Government Officer",
    href: "/government/login",
  },
  {
    badge: "Business",
    badgeVariant: "neutral",
    icon: Building2,
    highlight: false,
    title: "Business Intelligence",
    description:
      "Understand regulations, manage compliance risks, evaluate expansion opportunities and identify business impact.",
    features: [
      "Regulatory Intelligence",
      "Compliance Analysis",
      "Risk Assessment",
      "Expansion Readiness",
      "Business Impact",
    ],
    cta: "Continue as Business",
    href: "/business/login",
  },
];

const FLOW_STEPS = [
  {
    icon: ScrollText,
    title: "Regulation",
    description: "Understand applicable rules and changes.",
  },
  {
    icon: BrainCircuit,
    title: "Intelligence",
    description: "Connect regulation to businesses, problems and impact.",
  },
  {
    icon: Zap,
    title: "Action",
    description: "Identify responses, policies and solutions.",
  },
  {
    icon: Target,
    title: "Resolution",
    description: "Track implementation and verify outcomes.",
  },
];

const CAPABILITIES = [
  {
    icon: FileSearch2,
    title: "Regulatory Intelligence",
    description: "Monitor regulatory changes, obligations and compliance requirements across jurisdictions.",
  },
  {
    icon: Scale,
    title: "Impact Analysis",
    description: "Assess how regulations affect businesses, industries and real-world operations.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Intelligence",
    description: "Understand obligations and track compliance status across your operations.",
  },
  {
    icon: Gauge,
    title: "Risk Analysis",
    description: "Identify, evaluate and monitor regulatory and business risks with clear context.",
  },
  {
    icon: BookOpenCheck,
    title: "Policy Intelligence",
    description: "Evaluate policy options and support evidence-based policy development.",
  },
  {
    icon: MapPinned,
    title: "Ground Verification",
    description: "Validate reported outcomes and solutions against real-world evidence.",
  },
];

const PRINCIPLES = [
  {
    icon: Cpu,
    label: "AI",
    title: "AI",
    description: "Analyze patterns and generate recommendations.",
    accent: "blue",
  },
  {
    icon: FileCheck2,
    label: "EVIDENCE",
    title: "Evidence",
    description: "Ground decisions in relevant information and evidence.",
    accent: "green",
  },
  {
    icon: Users,
    label: "HUMAN DECISION",
    title: "Human Decision",
    description: "Authorized decision-makers make the final decision.",
    accent: "navy",
  },
];

const ABOUT_VALUES = [
  {
    icon: FileCheck2,
    title: "Evidence",
    description: "Decisions grounded in verified information and real-world verification.",
  },
  {
    icon: BrainCircuit,
    title: "Intelligence",
    description: "Regulatory signals analyzed and connected into clear, actionable insight.",
  },
  {
    icon: Target,
    title: "Action",
    description: "Clear responses, policies and solutions that can be tracked to outcomes.",
  },
];

function FlowConnector({ horizontal }) {
  if (horizontal) {
    return (
      <div className="mt-7 flex-1 px-4" aria-hidden="true">
        <div className="relative flex items-center">
          <span className="h-px flex-1 bg-line-strong" />
          <ChevronRight className="h-4 w-4 text-content-muted" strokeWidth={2.5} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center py-1" aria-hidden="true">
      <span className="h-6 w-px bg-line-strong" />
      <span className="-mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface-muted">
        <ChevronDown className="h-3.5 w-3.5 text-content-muted" strokeWidth={2.5} />
      </span>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]"
        style={{
          background:
            "radial-gradient(60% 90% at 70% 0%, var(--c-primary-soft) 0%, rgba(255,255,255,0) 70%), radial-gradient(50% 80% at 20% 10%, var(--c-soft) 0%, rgba(255,255,255,0) 70%)",
        }}
        aria-hidden="true"
      />
      <div className="u-container grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-14 lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 text-xs font-semibold tracking-[0.08em] text-content-secondary uppercase shadow-sm">
            <Layers className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Regulatory Intelligence Platform
          </span>

          <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight text-content sm:text-5xl lg:text-[56px] xl:text-6xl">
            From Regulation
            <br />
            to <span className="text-primary">Resolution.</span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-content-secondary sm:text-lg">
            Transform complex regulations, business impact, and real-world problems into
            actionable intelligence and evidence-based decisions.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="#roles" size="lg">
              Explore REGULENS
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button href="#intelligence" variant="outline" size="lg">
              <Play className="h-4 w-4" aria-hidden="true" />
              See how it works
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
            {["Evidence-backed", "Explainable", "Human-in-the-loop"].map((item, index) => (
              <span key={item} className="flex items-center gap-2 text-sm font-medium text-content-secondary">
                {index > 0 && (
                  <span className="mr-2 h-1 w-1 rounded-full bg-line-strong sm:mr-0" aria-hidden="true" />
                )}
                <Check className="h-4 w-4 text-primary" strokeWidth={3} aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function RoleSection() {
  return (
    <section id="roles" className="border-t border-line bg-surface-muted/60">
      <div className="u-container py-20 lg:py-24">
        <SectionHeading
          eyebrow="Workspaces"
          title="How do you want to use REGULENS?"
          subtitle="Choose the intelligence workspace designed for your role."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-8">
          {ROLE_CARDS.map((card) => (
            <RoleCard key={card.badge} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function IntelligenceSection() {
  return (
    <section id="intelligence" className="scroll-mt-20">
      <div className="u-container py-20 lg:py-24">
        <SectionHeading
          eyebrow="How it works"
          title="From Regulation to Resolution"
          subtitle="One intelligence layer connecting regulatory information to measurable action."
        />

        <div className="mt-14 hidden lg:flex lg:items-start">
          {FLOW_STEPS.map((step, index) => (
            <Fragment key={step.title}>
              <ProcessStep
                index={`0${index + 1}`}
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
              {index < FLOW_STEPS.length - 1 && <FlowConnector horizontal />}
            </Fragment>
          ))}
        </div>

        <div className="mt-10 lg:hidden">
          {FLOW_STEPS.map((step, index) => (
            <div key={step.title} className="flex justify-center">
              <div className="flex w-full max-w-[280px] flex-col">
                <ProcessStep
                  index={`0${index + 1}`}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                />
                {index < FLOW_STEPS.length - 1 && <FlowConnector />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EcosystemSection() {
  return (
    <section id="product" className="scroll-mt-20 border-t border-line bg-surface-muted/60">
      <div className="u-container py-20 lg:py-24">
        <SectionHeading
          eyebrow="Ecosystem"
          title="One platform. Multiple perspectives."
          subtitle="A connected intelligence network spanning policy, regulation, business and the real world."
        />
        <div className="mt-10">
          <EcosystemDiagram />
          <div className="mt-8 lg:hidden">
            <MobileEcosystem />
          </div>
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  return (
    <section className="scroll-mt-20">
      <div className="u-container py-20 lg:py-24">
        <SectionHeading
          eyebrow="Capabilities"
          title="Intelligence across the regulatory lifecycle"
          subtitle="Purpose-built capabilities covering analysis, impact, compliance, risk, policy and verification."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((capability) => (
            <FeatureCard key={capability.title} {...capability} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PrincipleSection() {
  return (
    <section id="principle" className="scroll-mt-20 border-t border-line bg-surface-muted/60">
      <div className="u-container py-20 lg:py-24">
        <div className="mb-14 flex flex-col items-center gap-3 text-center">
          <Badge variant="blue" size="md">
            Decision principle
          </Badge>
          <h2 className="max-w-3xl text-[26px] leading-tight font-semibold tracking-tight text-content sm:text-3xl lg:text-4xl">
            AI recommends. <span className="text-primary">Evidence supports.</span> Humans decide.
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-content-secondary sm:text-lg">
            This is a core REGULENS principle.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {PRINCIPLES.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.label}
                className="relative flex flex-col gap-4 rounded-card border border-line bg-surface p-7 shadow-card"
              >
                <span className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-panel bg-primary-soft text-primary" aria-hidden="true">
                    <Icon className="h-[22px] w-[22px]" />
                  </span>
                  {index === 2 && (
                    <Badge variant="neutral" size="sm">
                      Final authority
                    </Badge>
                  )}
                </span>
                <span className="text-xs font-semibold tracking-widest text-content-muted uppercase">
                  {principle.label}
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-content">{principle.title}</h3>
                <p className="text-[15px] leading-relaxed text-content-secondary">{principle.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20">
      <div className="u-container py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            align="left"
            eyebrow="About"
            title="About REGULENS"
            subtitle="REGULENS connects regulatory intelligence with real-world business and government decisions."
          />
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {ABOUT_VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="flex flex-col gap-3 rounded-panel border border-line bg-surface p-5 shadow-card"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-primary-soft text-primary" aria-hidden="true">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[15px] font-semibold text-content">{value.title}</h3>
                    <p className="text-sm leading-relaxed text-content-secondary">{value.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="border-t border-line bg-surface-muted/60">
      <div className="u-container py-20 lg:py-24">
        <div className="relative overflow-hidden rounded-card border border-line bg-surface p-8 text-center shadow-card-hover sm:p-12 lg:p-16">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 120% at 50% 0%, var(--c-primary-soft) 0%, rgba(255,255,255,0) 70%)",
            }}
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-center gap-5">
            <h2 className="max-w-2xl text-[28px] leading-tight font-semibold tracking-tight text-content sm:text-4xl">
              Turn regulatory complexity into clarity.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-content-secondary sm:text-lg">
              Explore the intelligence workspace built for better regulatory and business decisions.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button href="/government/login" size="md" className="px-5">
                <Landmark className="h-4 w-4" aria-hidden="true" />
                Government Intelligence
              </Button>
              <Button href="/business/login" variant="outline" size="md" className="px-5">
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Business Intelligence
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>REGULENS — From Regulation to Resolution</title>
        <meta
          name="description"
          content="REGULENS is a regulatory intelligence platform connecting government and business to evidence-backed decisions."
        />
      </Head>
      <Navbar />
      <main>
        <HeroSection />
        <RoleSection />
        <IntelligenceSection />
        <EcosystemSection />
        <CapabilitiesSection />
        <PrincipleSection />
        <AboutSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}