import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Features />
      <Plans />
      <ScriptureBanner />
      <CtaSection />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-3.5rem)] bg-[#040c07] flex flex-col items-center justify-center px-5 py-16 text-center overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[400px] h-[260px] bg-emerald-500/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 -right-10 w-64 h-64 bg-emerald-700/12 rounded-full blur-[70px] pointer-events-none" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 text-xs font-semibold tracking-[0.18em] uppercase mb-8">
          <CrossIcon className="w-3 h-3" />
          Church Bible Reading
        </div>

        {/* Headline */}
        <h1 className="font-display leading-[1.08] font-bold mb-5">
          <span className="block text-[2.7rem] bg-gradient-to-br from-white via-green-100 to-green-300 bg-clip-text text-transparent">
            Read the Word.
          </span>
          <span className="block text-[2.7rem] bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-300 bg-clip-text text-transparent">
            Every Day.
          </span>
        </h1>

        <p className="text-green-200/70 text-base leading-relaxed mb-8 max-w-[270px]">
          Your church's daily companion for reading, reflecting, and growing in the Word.
        </p>

        {/* Verse card */}
        <div className="w-full rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] backdrop-blur-md p-4 mb-8 text-left">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400/80 text-[10px] font-semibold tracking-[0.15em] uppercase">
              Verse of the Day
            </span>
          </div>
          <p className="font-display text-white/90 text-sm leading-relaxed italic">
            "Your word is a lamp to my feet and a light to my path."
          </p>
          <p className="text-green-400/60 text-xs mt-2 font-medium">Psalm 119:105 · ESV</p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/sign-up"
            className="bg-emerald-400 text-green-950 px-6 py-3.5 rounded-xl font-bold text-base text-center shadow-[0_0_28px_rgba(52,211,153,0.3)] hover:bg-emerald-300 hover:shadow-[0_0_40px_rgba(52,211,153,0.4)] active:scale-[0.98] transition-all duration-200"
          >
            Start Reading Free
          </Link>
          <Link
            href="/plans"
            className="bg-white/[0.06] border border-white/12 text-white px-6 py-3.5 rounded-xl font-medium text-base text-center hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
          >
            Browse Plans
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 mt-10 pt-8 border-t border-white/8 w-full">
          <Stat value="5+" label="Plans" />
          <div className="w-px h-8 bg-white/10" />
          <Stat value="300" label="Days" />
          <div className="w-px h-8 bg-white/10" />
          <Stat value="Free" label="Forever" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-white font-bold text-xl leading-none">{value}</p>
      <p className="text-green-400/60 text-xs mt-1">{label}</p>
    </div>
  );
}

function Features() {
  return (
    <section className="bg-[#061009] py-20 px-5">
      <div className="max-w-sm mx-auto">
        <p className="text-emerald-400 text-[10px] font-bold tracking-[0.22em] uppercase text-center mb-2">
          Why SurfBible
        </p>
        <h2 className="font-display text-[1.75rem] font-bold text-white text-center mb-10 leading-tight">
          Everything you need<br />to stay in the Word
        </h2>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-emerald-950/50 via-green-900/20 to-transparent p-6">
            <div className="w-11 h-11 rounded-xl bg-emerald-400/15 flex items-center justify-center text-emerald-400 mb-4">
              <BookOpenIcon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-2">Guided Reading Plans</h3>
            <p className="text-green-200/60 text-sm leading-relaxed">
              The Navigators plan, NT-in-90, Psalms & Proverbs and more. Structured passages every day to take you through Scripture from beginning to end.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/15 flex items-center justify-center text-emerald-400 mb-3">
                <FlameIcon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1.5 leading-tight">Streak Tracking</h3>
              <p className="text-green-200/50 text-xs leading-relaxed">Daily habit with streaks and monthly freeze.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/15 flex items-center justify-center text-emerald-400 mb-3">
                <UsersIcon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1.5 leading-tight">Church Groups</h3>
              <p className="text-green-200/50 text-xs leading-relaxed">Read together. See everyone's progress.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-400/15 flex items-center justify-center text-emerald-400 shrink-0">
              <BellIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm mb-1">Daily Reminders</h3>
              <p className="text-green-200/60 text-sm leading-relaxed">A gentle nudge at your preferred time.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Plans() {
  return (
    <section className="bg-green-50 py-16">
      <p className="text-emerald-600 text-[10px] font-bold tracking-[0.22em] uppercase text-center mb-2 px-5">
        Reading Plans
      </p>
      <h2 className="font-display text-[1.75rem] font-bold text-stone-900 text-center mb-2 px-5 leading-tight">
        Start where you are
      </h2>
      <p className="text-stone-400 text-sm text-center mb-8 px-5">
        Structured plans for every season of faith
      </p>

      <div className="flex gap-3.5 overflow-x-auto px-5 pb-1 snap-x snap-mandatory scrollbar-hide">
        <PlanCard title="Navigators Plan" days={300} desc="2 NT + 2 OT passages daily. The classic whole-Bible discipleship plan." tag="Most Popular" accent="border-emerald-200 bg-white" tagCls="bg-emerald-100 text-emerald-700" dot="bg-emerald-500" />
        <PlanCard title="NT in 90 Days"   days={90}  desc="The entire New Testament in three months. Ideal for new believers."     tag="Quick Start"  accent="border-green-200 bg-white"   tagCls="bg-green-100 text-green-700"   dot="bg-green-500"   />
        <PlanCard title="Psalms & Proverbs" days={30} desc="Wisdom and worship in one month. A focused devotional journey."         tag="30 Days"     accent="border-teal-200 bg-white"    tagCls="bg-teal-100 text-teal-700"    dot="bg-teal-500"    />
      </div>

      <div className="text-center mt-7 px-5">
        <Link href="/plans" className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-sm hover:text-emerald-700">
          See all plans <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

function PlanCard({ title, days, desc, tag, accent, tagCls, dot }: {
  title: string; days: number; desc: string; tag: string;
  accent: string; tagCls: string; dot: string;
}) {
  return (
    <div className={`flex-shrink-0 snap-start w-[248px] rounded-2xl border ${accent} p-5 flex flex-col gap-3.5 shadow-sm`}>
      <span className={`self-start text-[11px] font-bold px-2.5 py-1 rounded-full ${tagCls}`}>{tag}</span>
      <div>
        <h3 className="font-semibold text-stone-900 text-sm leading-tight mb-1">{title}</h3>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          <p className="text-xs text-stone-400 font-medium">{days} days</p>
        </div>
      </div>
      <p className="text-stone-500 text-xs leading-relaxed flex-1">{desc}</p>
      <Link href="/plans" className="text-emerald-600 font-semibold text-xs hover:text-emerald-700">Enroll →</Link>
    </div>
  );
}

function ScriptureBanner() {
  return (
    <section className="relative bg-[#040c07] py-20 px-6 text-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(52,211,153,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 max-w-sm mx-auto flex flex-col items-center gap-5">
        <div className="w-10 h-10 rounded-full border border-emerald-400/25 bg-emerald-400/10 flex items-center justify-center text-emerald-400">
          <CrossIcon className="w-4 h-4" />
        </div>
        <blockquote className="font-display text-white/90 text-xl leading-relaxed italic">
          "All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness."
        </blockquote>
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-emerald-400/40" />
          <cite className="not-italic text-emerald-400 text-sm font-medium tracking-wide">2 Timothy 3:16</cite>
          <div className="h-px w-8 bg-emerald-400/40" />
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative bg-[#061009] py-16 px-5 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-emerald-400/8 rounded-full blur-[60px] pointer-events-none" />
      <div className="relative z-10 max-w-sm mx-auto">
        <div className="rounded-3xl border border-emerald-400/20 bg-gradient-to-b from-emerald-950/40 to-transparent p-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-400/15 flex items-center justify-center text-emerald-400 mb-5">
            <CrossIcon className="w-5 h-5" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-3 leading-tight">
            Begin your reading journey
          </h2>
          <p className="text-green-200/60 text-sm leading-relaxed mb-7 max-w-[240px]">
            Join your church on SurfBible and build a lasting habit in the Word. Free to start.
          </p>
          <Link
            href="/sign-up"
            className="w-full bg-emerald-400 text-green-950 py-3.5 rounded-xl font-bold text-base text-center shadow-[0_0_28px_rgba(52,211,153,0.25)] hover:bg-emerald-300 hover:shadow-[0_0_40px_rgba(52,211,153,0.35)] active:scale-[0.98] transition-all duration-200"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </section>
  );
}

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="currentColor" aria-hidden="true">
      <rect x="17" y="3" width="6" height="34" rx="3" />
      <rect x="5" y="13" width="30" height="6" rx="3" />
    </svg>
  );
}
function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 3.5A5.5 5.5 0 0 0 4.5 3H2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h2.5A4.5 4.5 0 0 1 9 18.91V5.41A5.48 5.48 0 0 0 10 3.5Zm1 15.41A4.5 4.5 0 0 1 15.5 15H18a.5.5 0 0 0 .5-.5v-11A.5.5 0 0 0 18 3h-2.5A5.5 5.5 0 0 0 11 3.5v15.41Z" />
    </svg>
  );
}
function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 0 0-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 0 0-.613 3.58 2.64 2.64 0 0 1-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 0 0 5.05 6.05 6.981 6.981 0 0 0 3 11a7 7 0 1 0 11.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03Z" clipRule="evenodd" />
    </svg>
  );
}
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 17a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
    </svg>
  );
}
function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z" clipRule="evenodd" />
    </svg>
  );
}
