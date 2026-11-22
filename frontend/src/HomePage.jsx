import { ArrowRight, ArrowUpRight, FileCheck2, Leaf, Search, ShieldCheck, Sprout, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteHeader from "./components/SiteHeader.jsx";

export default function HomePage() {
  const { t } = useTranslation();
  const steps = [
    { icon: Users, title: t("stepOneTitle"), body: t("stepOneBody") },
    { icon: Search, title: t("stepTwoTitle"), body: t("stepTwoBody") },
    { icon: FileCheck2, title: t("stepThreeTitle"), body: t("stepThreeBody") },
  ];

  return (
    <div className="min-h-screen bg-canvas text-slate-800">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-36 -top-32 h-[490px] w-[490px] rounded-full border border-leaf/10" />
          <div className="pointer-events-none absolute -right-16 -top-10 h-[330px] w-[330px] rounded-full border border-leaf/10" />
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 md:grid-cols-[1.05fr_.95fr]">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-leaf/20 bg-white/70 px-3.5 py-2 text-xs font-bold uppercase tracking-[.13em] text-leaf">
                <Leaf size={14} /> {t("heroEyebrow")}
              </div>
              <h1 className="max-w-[660px] text-[clamp(3rem,7vw,5.25rem)] font-extrabold leading-[1.04] tracking-[-.055em] text-forest">
                {t("heroTitle")}<br /><span className="text-leaf">{t("heroAccent")}</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{t("heroBody")}</p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link to="/schemes" className="inline-flex items-center gap-3 rounded-xl bg-forest px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-forest/15 transition hover:-translate-y-0.5 hover:bg-leaf">
                  {t("homeCtaButton")} <ArrowRight size={17} />
                </Link>
                <span className="text-xs font-medium text-slate-500">{t("noAccount")}</span>
              </div>
              <div className="mt-9 flex items-center gap-3 text-xs font-semibold text-slate-500">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-lime/60 text-forest"><ShieldCheck size={18} /></span>
                <span>{t("applicationsNote")}</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[500px] md:ml-auto">
              <div className="absolute inset-8 rounded-[36px] bg-[#e5edd8] blur-2xl" />
              <div className="relative rounded-[30px] border border-white bg-[#eaf0e2] p-5 sm:p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[.14em] text-leaf">{t("finderEyebrow")}</span>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-forest">{t("homeHowTitle")}</h2>
                  </div>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-leaf"><Sprout size={22} /></span>
                </div>
                <div className="mt-6 space-y-3">
                  {steps.map(({ icon: Icon, title }, index) => (
                    <div key={title} className="flex items-center gap-3 rounded-2xl bg-white/85 p-3.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eff4e8] text-leaf"><Icon size={18} /></span>
                      <span className="flex-1 text-sm font-semibold text-forest">{title}</span>
                      <span className="text-xs font-bold text-slate-400">0{index + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-forest/10 pt-4 text-xs text-slate-500">
                  <ShieldCheck size={15} className="text-leaf" /> {t("noAccount")}
                </div>
              </div>
              <div className="absolute -bottom-5 -left-2 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-forest/10 sm:-left-7">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime/50 text-forest"><ArrowUpRight size={18} /></span>
                <span><b className="block text-sm text-forest">{t("homeCta")}</b><small className="text-xs text-slate-500">{t("noAccount")}</small></span>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="mb-8 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[.16em] text-leaf">{t("howItWorks")}</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-forest">{t("homeHowTitle")}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{t("homeHowBody")}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }, index) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eff4e8] text-leaf"><Icon size={20} /></span>
                <span className="mt-5 block text-xs font-bold text-leaf">0{index + 1}</span>
                <h3 className="mt-1 font-extrabold text-forest">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="scroll-mt-24 px-5 pb-14 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-3xl bg-lime px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-9">
            <div>
              <span className="text-xs font-bold uppercase tracking-[.15em] text-forest/70">{t("aboutTitle")}</span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-forest">{t("aboutBody")}</h2>
            </div>
            <Link to="/schemes" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white hover:bg-leaf">
              {t("homeCtaButton")} <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-forest/10 px-5 py-7 text-center text-xs text-slate-500 sm:px-8">
        {t("footer")} · SchemeSaathi
      </footer>
    </div>
  );
}
