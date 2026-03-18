import Link from 'next/link';
import { Calendar, Download, Globe, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
          <span className="bg-gradient-to-r from-[var(--accent)] to-purple-400 bg-clip-text text-transparent">Q</span>alendr
        </span>
        <Link
          href="/erstellen"
          className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          Kalender erstellen
        </Link>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6">
        <section className="relative pt-20 pb-24 text-center">
          {/* Ambient glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-[var(--accent)] opacity-[0.06] blur-[100px] rounded-full pointer-events-none" />

          <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            <span className="bg-gradient-to-br from-[var(--accent)] via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dein Kalender,
            </span>
            <br />
            <span className="text-[var(--text-primary)]">deine Regeln.</span>
          </h1>

          <p className="relative mt-6 text-lg text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
            Feiertage, Schulferien, Mondphasen, kuriose Tage und mehr &mdash;
            alles in einer .ics-Datei für deinen Kalender.
          </p>

          <div className="relative mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/erstellen"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[var(--accent)]/25"
            >
              <Sparkles className="h-4 w-4" />
              Kalender erstellen
            </Link>
            <span className="text-xs text-[var(--text-muted)]">Kostenlos &middot; Kein Account nötig</span>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 border-t border-[var(--border)]">
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center sm:text-left">
              <div className="inline-flex p-3 rounded-2xl bg-[var(--indigo-bg)] mb-4">
                <Globe className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">14+ Länder</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Feiertage und Schulferien für Deutschland, Österreich, Schweiz, Frankreich, USA und viele mehr.
              </p>
            </div>

            <div className="text-center sm:text-left">
              <div className="inline-flex p-3 rounded-2xl bg-[var(--purple-bg)] mb-4">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">Alles in einem Kalender</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Mondphasen, Brückentage, kuriose Feiertage, Wikipedia-Jahrestage &mdash; du wählst, was reinkommt.
              </p>
            </div>

            <div className="text-center sm:text-left">
              <div className="inline-flex p-3 rounded-2xl bg-[var(--teal-bg)] mb-4">
                <Download className="h-6 w-6 text-teal-500" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">Einfach importieren</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Eine .ics-Datei für Apple Kalender, Google Kalender, Outlook und jede andere Kalender-App.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 border-t border-[var(--border)]">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-12">So funktioniert&apos;s</h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Kategorien wählen', desc: 'Feiertage, Mondphasen, kuriose Tage und mehr' },
              { step: '2', title: 'Länder festlegen', desc: 'Nur für Feiertage und Schulferien relevant' },
              { step: '3', title: 'Feintuning', desc: 'Einzelne Einträge an- oder abwählen' },
              { step: '4', title: 'Herunterladen', desc: '.ics-Datei in deinen Kalender importieren' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--accent-light)] text-[var(--accent)] font-bold text-sm mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-10 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
        <p>Daten ohne Gewähr. Stand: 2026&ndash;2028</p>
        <div className="mt-3 flex justify-center gap-6">
          <Link href="/impressum" className="hover:text-[var(--accent)] transition-colors">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-[var(--accent)] transition-colors">Datenschutz</Link>
        </div>
      </footer>
    </div>
  );
}
