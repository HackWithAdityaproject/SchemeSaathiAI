import { useState } from "react";
import { Languages, Menu, Sprout, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext.jsx";

const languages = [
  ["en", "English"],
  ["hi", "हिन्दी"],
  ["te", "తెలుగు"],
  ["kn", "ಕನ್ನಡ"],
  ["ta", "தமிழ்"],
];

export default function SiteHeader() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function changeLanguage(event) {
    i18n.changeLanguage(event.target.value);
  }

  function closeMobileNav() {
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-forest/10 bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label="SchemeSaathi home">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-forest text-lime"><Sprout size={23} /></span>
          <span className="text-[19px] font-extrabold tracking-tight text-forest">SchemeSaathi<span className="text-leaf">.</span></span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          <Link to="/" className="hover:text-forest">{t("navHome")}</Link>
          <Link to="/schemes" className="hover:text-forest">{t("navExplore")}</Link>
          <Link to="/#how" className="hover:text-forest">{t("navHow")}</Link>
          <Link to="/#about" className="hover:text-forest">{t("navAbout")}</Link>
        </nav>
        <div className="flex items-center gap-2.5">
          <Languages size={17} className="text-leaf" />
          <label className="sr-only" htmlFor="language">Language</label>
          <select id="language" onChange={changeLanguage} value={i18n.language} className="max-w-28 bg-transparent text-sm font-semibold text-forest outline-none">
            {languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
          <Link to={user ? "/account" : "/login"} className="hidden rounded-lg border border-forest/15 px-3 py-2 text-xs font-bold text-forest hover:bg-white sm:inline-flex">
            {user?.displayName || t("signIn")}
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-forest md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="flex flex-col gap-4 border-t border-forest/10 px-6 py-5 text-sm font-semibold md:hidden">
          <Link to="/" onClick={closeMobileNav}>{t("navHome")}</Link>
          <Link to="/schemes" onClick={closeMobileNav}>{t("navExplore")}</Link>
          <Link to="/#how" onClick={closeMobileNav}>{t("navHow")}</Link>
          <Link to="/#about" onClick={closeMobileNav}>{t("navAbout")}</Link>
          <Link to={user ? "/account" : "/login"} onClick={closeMobileNav}>
            {user?.displayName || t("signIn")}
          </Link>
        </nav>
      )}
    </header>
  );
}
