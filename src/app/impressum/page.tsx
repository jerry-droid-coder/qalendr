import Link from 'next/link';

export const metadata = {
  title: 'Impressum - Qalendr',
  description: 'Impressum und Anbieterkennzeichnung',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-50 backdrop-blur-sm bg-[var(--bg-primary)]/80 border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
          >
            Qalendr
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Impressum</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              Angaben gemäß § 5 TMG
            </h2>
            <div className="text-[var(--text-secondary)] space-y-2">
              <p className="font-medium text-[var(--text-primary)]">[DEIN NAME]</p>
              <p>[STRASSE UND HAUSNUMMER]</p>
              <p>[PLZ] [ORT]</p>
              <p>[LAND]</p>
            </div>
          </section>

          <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              Kontakt
            </h2>
            <div className="text-[var(--text-secondary)] space-y-2">
              <p>E-Mail: <a href="mailto:[DEINE-EMAIL]" className="text-[var(--accent)] hover:underline">[DEINE-EMAIL]</a></p>
              {/* Optional: Telefon */}
              {/* <p>Telefon: [DEINE TELEFONNUMMER]</p> */}
            </div>
          </section>

          <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <div className="text-[var(--text-secondary)] space-y-2">
              <p className="font-medium text-[var(--text-primary)]">[DEIN NAME]</p>
              <p>[STRASSE UND HAUSNUMMER]</p>
              <p>[PLZ] [ORT]</p>
            </div>
          </section>

          <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              Haftungsausschluss
            </h2>

            <h3 className="text-lg font-medium text-[var(--text-primary)] mt-4 mb-2">
              Haftung für Inhalte
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              Die bereitgestellten Kalender-Daten (Feiertage, Schulferien etc.) dienen nur zur
              Information und sind ohne Gewähr.
            </p>

            <h3 className="text-lg font-medium text-[var(--text-primary)] mt-4 mb-2">
              Haftung für Links
            </h3>
            <p className="text-[var(--text-secondary)]">
              Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              verantwortlich.
            </p>
          </section>

          <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              Urheberrecht
            </h2>
            <p className="text-[var(--text-secondary)]">
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
              Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </main>
    </div>
  );
}
