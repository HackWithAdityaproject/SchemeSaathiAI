import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUpRight, Check, ChevronDown, FileText, LoaderCircle, MessageCircle, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { getCategories, getMatches, getSchemes, processDocument } from "./api.js";
import AssistantChat from "./components/AssistantChat.jsx";
import SiteHeader from "./components/SiteHeader.jsx";

const profileSchema = z.object({
  query: z.string().max(500).optional(),
  category: z.string().optional(),
  state: z.string().optional(),
  annualIncome: z.preprocess(
    (value) => value === "" || value == null ? undefined : Number(value),
    z.number().min(0).optional(),
  ),
  age: z.preprocess(
    (value) => value === "" || value == null ? undefined : Number(value),
    z.number().min(1).max(120).optional(),
  ),
});

const categoryTranslationKeys = {
  Students: "categoryStudents",
  Farmers: "categoryFarmers",
  Women: "categoryWomen",
  "Senior Citizens": "categorySeniors",
  "Persons with Disabilities": "categoryDisabilities",
  "Economically Weaker Families": "categoryFamilies",
  "Unemployed Youth": "categoryYouth",
  "Entrepreneurs and Small Businesses": "categoryBusiness",
  "Workers and Labourers": "categoryWorkers",
  "General Citizens": "categoryGeneral",
};

const states = [
  "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Gujarat", "Haryana",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha",
  "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
  "West Bengal",
];

function categoryLabel(t, name) {
  return t(categoryTranslationKeys[name] || name || "General");
}

export default function SchemesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expanded, setExpanded] = useState("");
  const [error, setError] = useState("");
  const [documentBusy, setDocumentBusy] = useState(false);
  const [documentMessage, setDocumentMessage] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { query: "", category: "", state: "", annualIncome: "", age: "" },
  });

  useEffect(() => {
    let active = true;
    Promise.all([getCategories(), getSchemes()])
      .then(([categoryData, schemeData]) => {
        if (!active) return;
        setCategories(categoryData);
        setSchemes(schemeData);
        setError("");
      })
      .catch(() => active && setError(t("errorBackend")))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [t]);

  const activeCategory = useMemo(
    () => categories.find((category) => category.name === selectedCategory),
    [categories, selectedCategory],
  );
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 4);

  async function onSubmit(values) {
    setSearching(true);
    setError("");
    try {
      const results = await getMatches({
        ...values,
        category: selectedCategory || values.category || undefined,
        annualIncome: values.annualIncome == null || values.annualIncome === "" ? undefined : Number(values.annualIncome),
        age: values.age == null || values.age === "" ? undefined : Number(values.age),
      });
      setSchemes(results);
    } catch {
      setError(t("errorBackend"));
    } finally {
      setSearching(false);
    }
  }

  async function chooseCategory(name) {
    const nextCategory = selectedCategory === name ? "" : name;
    setSelectedCategory(nextCategory);
    setValue("category", nextCategory);
    setSearching(true);
    setError("");
    try {
      setSchemes(await getSchemes(nextCategory));
    } catch {
      setError(t("errorBackend"));
    } finally {
      setSearching(false);
    }
  }

  async function clearSearch() {
    setSelectedCategory("");
    reset({ query: "", category: "", state: "", annualIncome: "", age: "" });
    setSearching(true);
    setError("");
    try {
      setSchemes(await getSchemes());
    } catch {
      setError(t("errorBackend"));
    } finally {
      setSearching(false);
    }
  }

  async function handleDocument(file) {
    if (!file) return;
    setDocumentBusy(true);
    setDocumentMessage("");
    try {
      const result = await processDocument(file);
      if (result.annualIncome != null) setValue("annualIncome", result.annualIncome, { shouldValidate: true });
      if (result.age != null) setValue("age", result.age, { shouldValidate: true });
      setDocumentMessage(result.message);
    } catch {
      setDocumentMessage(t("documentError"));
    } finally {
      setDocumentBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-slate-800">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <div className="mb-7 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[.16em] text-leaf">{t("finderEyebrow")}</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-forest sm:text-4xl">{t("finderTitle")}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{t("finderDescription")}</p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label={t("finderTitle")}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="scheme-query">{t("searchLabel")}</label>
              <div className="flex h-12 flex-1 items-center gap-3 rounded-xl border border-slate-200 px-3.5 focus-within:border-leaf focus-within:ring-4 focus-within:ring-leaf/10">
                <Search size={18} className="shrink-0 text-leaf" />
                <input id="scheme-query" maxLength={150} {...register("query")} placeholder={t("schemeSearchHint")} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
              </div>
              <button disabled={searching} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-forest px-5 text-sm font-bold text-white hover:bg-leaf disabled:opacity-60">
                {searching ? <LoaderCircle size={17} className="animate-spin" /> : <Search size={17} />}
                {t("searchButton")}
              </button>
            </div>
            {errors.query && <p className="mt-2 text-xs text-red-600">{t("searchLabel")}</p>}

            <div className="mt-5">
              <h2 className="text-sm font-extrabold text-forest">{t("categoriesTitle")}</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {visibleCategories.map((category) => (
                  <button
                    type="button"
                    key={category.id || category.name}
                    onClick={() => chooseCategory(category.name)}
                    aria-pressed={selectedCategory === category.name}
                    className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf/30 ${selectedCategory === category.name ? "border-forest bg-forest text-white" : "border-slate-200 bg-white text-forest hover:border-leaf hover:bg-[#f5f7f2]"}`}
                  >
                    {categoryLabel(t, category.name)}
                  </button>
                ))}
              </div>
              {categories.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllCategories((shown) => !shown)}
                  className="mt-3 min-h-10 text-sm font-bold text-leaf underline-offset-4 hover:underline"
                >
                  {t(showAllCategories ? "fewerCategories" : "moreCategories")}
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <button type="button" onClick={() => setShowFilters((value) => !value)} aria-expanded={showFilters} className="inline-flex items-center gap-2 text-xs font-bold text-leaf hover:text-forest">
                {showFilters ? t("hideFilters") : t("filtersToggle")}
                <ChevronDown size={15} className={`transition ${showFilters ? "rotate-180" : ""}`} />
              </button>
              <span className="text-xs text-slate-500">{t("noAccount")}</span>
            </div>

            {showFilters && (
              <div className="mt-3 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="scheme-state" className="mb-1.5 block text-xs font-bold text-forest">{t("stateLabel")}</label>
                  <select id="scheme-state" {...register("state")} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-leaf">
                    <option value="">{t("stateAllIndia")}</option>
                    {states.map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="scheme-income" className="mb-1.5 block text-xs font-bold text-forest">{t("annualIncomeLabel")}</label>
                  <input id="scheme-income" type="number" min="0" {...register("annualIncome")} placeholder="250000" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-leaf" />
                </div>
                <div>
                  <label htmlFor="scheme-age" className="mb-1.5 block text-xs font-bold text-forest">{t("ageLabel")}</label>
                  <input id="scheme-age" type="number" min="1" max="120" {...register("age")} placeholder="21" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-leaf" />
                </div>
                <div className="flex flex-wrap gap-3 sm:col-span-3">
                  <button disabled={searching} className="rounded-lg bg-leaf px-4 py-2 text-xs font-bold text-white hover:bg-forest disabled:opacity-60">{t("applyFilters")}</button>
                  <button type="button" onClick={clearSearch} className="rounded-lg px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50">{t("clearFilters")}</button>
                </div>
              </div>
            )}
          </form>

          <details className="mt-3 border-t border-slate-100 pt-3">
            <summary className="cursor-pointer list-none text-xs font-bold text-slate-600 hover:text-forest">
              <span className="inline-flex items-center gap-2"><FileText size={15} className="text-leaf" />{t("documentHelp")}</span>
            </summary>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input aria-label={t("documentHelp")} type="file" accept=".pdf,.txt,application/pdf,text/plain" disabled={documentBusy} onChange={(event) => {
                handleDocument(event.target.files?.[0]);
                event.target.value = "";
              }} className="max-w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#eff4e8] file:px-3 file:py-2 file:text-xs file:font-bold file:text-leaf" />
              {documentBusy && <LoaderCircle size={16} className="animate-spin text-leaf" />}
              {documentMessage && <span role="status" className="text-xs text-leaf">{documentMessage}</span>}
            </div>
          </details>
        </section>

        <div className="mb-4 mt-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-forest">{activeCategory ? categoryLabel(t, activeCategory.name) : t("matchesTitle")}</h2>
            <p className="mt-1 text-xs text-slate-500">{t("resultCount", { count: schemes.length })}</p>
          </div>
          {selectedCategory && <button type="button" onClick={clearSearch} className="text-xs font-bold text-leaf hover:text-forest">{t("clearFilters")}</button>}
        </div>

        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {loading || searching ? (
          <div className="flex min-h-44 items-center justify-center gap-3 text-sm font-semibold text-leaf"><LoaderCircle className="animate-spin" size={19} />{t("loading")}</div>
        ) : schemes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-leaf/30 bg-white/70 px-6 py-12 text-center">
            <h3 className="font-bold text-forest">{t("schemeEmptyTitle")}</h3>
            <p className="mt-2 text-sm text-slate-600">{t("schemeEmptyBody")}</p>
            <button type="button" onClick={clearSearch} className="mt-4 text-xs font-bold text-leaf hover:text-forest">{t("browseAll")}</button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {schemes.map((scheme) => (
              <article key={scheme.id || scheme.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#eef4e8] px-3 py-1 text-[11px] font-bold text-leaf">{categoryLabel(t, scheme.category)}</span>
                  {scheme.status && <span className="rounded-full bg-[#f7f4df] px-3 py-1 text-[11px] font-bold text-[#8a6c1a]">{scheme.status}</span>}
                  {scheme.matchReason && <span className="ml-auto rounded-full bg-lime/60 px-3 py-1 text-[11px] font-bold text-forest">{t("scoreLabel")}</span>}
                </div>
                <h3 className="mt-3 text-lg font-extrabold leading-snug text-forest">{scheme.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{scheme.description}</p>
                <div className="mt-3 rounded-xl bg-[#f5f7f2] px-3.5 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t("benefits")}</span>
                  <p className="mt-1 text-sm font-semibold text-forest">{scheme.benefit || t("closing")}</p>
                </div>
                {scheme.matchReason && <p className="mt-3 flex gap-2 text-xs leading-5 text-slate-600"><Check size={14} className="mt-0.5 shrink-0 text-leaf" />{scheme.matchReason}</p>}
                <button type="button" onClick={() => setExpanded(expanded === scheme.id ? "" : scheme.id)} className="mt-3 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-left text-xs font-bold text-leaf">
                  {t("details")} <ArrowDown size={15} className={`transition ${expanded === scheme.id ? "rotate-180" : ""}`} />
                </button>
                {expanded === scheme.id && <div className="mt-3 space-y-3 text-sm">
                  <div><b className="text-forest">{t("whyMatch")}</b><p className="mt-1 leading-6 text-slate-600">{scheme.eligibility || t("closing")}</p></div>
                  <div><b className="text-forest">{t("requirements")}</b><p className="mt-1 leading-6 text-slate-600">{(scheme.documents || []).join(", ") || t("closing")}</p></div>
                </div>}
                {(scheme.applicationUrl || scheme.officialUrl) && (
                  <a href={scheme.applicationUrl || scheme.officialUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-forest px-3.5 py-2.5 text-xs font-bold text-white hover:bg-leaf">
                    {t("officialSite")} <ArrowUpRight size={14} />
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
        <p className="mt-5 text-xs leading-5 text-slate-500">{t("applicationsNote")}</p>
      </main>
      <footer className="border-t border-forest/10 px-5 py-6 text-center text-xs text-slate-500">
        {t("footer")} · SchemeSaathi
      </footer>
      <button
        type="button"
        onClick={() => setAssistantOpen(true)}
        aria-haspopup="dialog"
        className="fixed bottom-5 right-5 z-40 inline-flex min-h-14 items-center gap-2 rounded-full bg-forest px-5 text-sm font-bold text-white shadow-xl shadow-forest/20 transition hover:bg-leaf focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf/30"
      >
        <MessageCircle size={20} /> {t("assistantLauncher")}
      </button>
      <AssistantChat open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
