import Link from 'next/link';

export const metadata = {
  title: 'Datenschutz - Qalendr',
  description: 'Datenschutzerklärung und Informationen zur Datenverarbeitung',
};

export default function DatenschutzPage() {
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
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Datenschutzerklärung</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              1. Datenschutz auf einen Blick
            </h2>

            <h3 className="text-lg font-medium text-[var(--text-primary)] mt-4 mb-2">
              Allgemeine Hinweise
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              Diese Website nimmt den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
              personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften
              sowie dieser Datenschutzerklärung.
            </p>

            <h3 className="text-lg font-medium text-[var(--text-primary)] mt-4 mb-2">
              Datenerfassung auf dieser Website
            </h3>
            <p className="text-[var(--text-secondary)]">
              Diese Website speichert <strong>keine personenbezogenen Daten auf unseren Servern</strong>.
              Es werden keine Cookies für Tracking oder Analyse verwendet. Alle Ihre Einstellungen werden
              ausschließlich lokal in Ihrem Browser gespeichert.
            </p>
          </section>

          <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              2. Verantwortliche Stelle
            </h2>
            <div className="text-[var(--text-secondary)] space-y-2">
              <p className="font-medium text-[var(--text-primary)]">Julian Huth</p>
              <p>Kölnische Str. 87</p>
              <p>34119 Kassel</p>
              <p>Deutschland</p>
              <p>E-Mail: <a href="mailto:huth.jj@gmail.com" className="text-[var(--accent)] hover:underline">huth.jj@gmail.com</a></p>
            </div>
          </section>

          <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              3. Lokale Speicherung (LocalStorage)
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">
              Diese Website verwendet den LocalStorage Ihres Browsers, um bestimmte Einstellungen zu
              speichern. Diese Daten werden <strong>nur auf Ihrem Gerät</strong> gespeichert und
              <strong> niemals an unsere Server übertragen</strong>.
            </p>

            <h3 className="text-lg font-medium text-[var(--text-primary)] mt-4 mb-2">
              Gespeicherte Daten:
            </h3>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
              <li>
                <strong>Theme-Einstellung:</strong> Ihre Präferenz für Light/Dark Mode
              </li>
              <li>
                <strong>Urlaubseinträge:</strong> Ihre persönlichen Urlaubszeiträume, die Sie eingeben
              </li>
            </ul>

            <h3 className="text-lg font-medium text-[var(--text-primary)] mt-4 mb-2">
              Ihre Rechte:
            </h3>
            <p className="text-[var(--text-secondary)]">
              Sie können diese Daten jederzeit löschen, indem Sie die Browserdaten/den LocalStorage
              für diese Website löschen. Die Website funktioniert auch ohne diese Speicherung, jedoch
              müssen Sie dann Ihre Einstellungen bei jedem Besuch neu vornehmen.
            </p>
          </section>

          <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              4. Externe Dienste
            </h2>

            <h3 className="text-lg font-medium text-[var(--text-primary)] mt-4 mb-2">
              Google Fonts
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              Diese Website verwendet Schriftarten von Google Fonts. Beim Aufruf der Seite lädt Ihr
              Browser die benötigten Schriftarten in Ihren Browser-Cache. Dabei wird eine Verbindung
              zu Servern von Google hergestellt.
            </p>
            <p className="text-[var(--text-secondary)] mb-4">
              Google erfährt dadurch, dass über Ihre IP-Adresse diese Website aufgerufen wurde.
              Die Nutzung von Google Fonts erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
              Der Websitebetreiber hat ein berechtigtes Interesse an der einheitlichen Darstellung
              des Schriftbildes auf seiner Website.
            </p>
            <p className="text-[var(--text-secondary)]">
              Weitere Informationen zu Google Fonts finden Sie unter:{' '}
              <a
                href="https://developers.google.com/fonts/faq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                https://developers.google.com/fonts/faq
              </a>
              {' '}und in der Datenschutzerklärung von Google:{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                https://policies.google.com/privacy
              </a>
            </p>
          </section>

          <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              5. Keine Cookies
            </h2>
            <p className="text-[var(--text-secondary)]">
              Diese Website verwendet <strong>keine Cookies</strong> für Tracking, Analyse oder Werbung.
              Es werden keine Daten an Dritte zu Marketingzwecken weitergegeben.
            </p>
          </section>

          <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              6. Hosting
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">
              Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die
              personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern
              des Hosters gespeichert. Hierbei kann es sich v.a. um IP-Adressen, Kontaktanfragen,
              Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe
              und sonstige Daten, die über eine Website generiert werden, handeln.
            </p>
            <p className="text-[var(--text-secondary)]">
              Der Einsatz des Hosters erfolgt im Interesse einer sicheren, schnellen und effizienten
              Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6
              Abs. 1 lit. f DSGVO).
            </p>
          </section>

          <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              7. Ihre Rechte
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">
              Sie haben jederzeit das Recht:
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
              <li>Auskunft über Ihre bei uns gespeicherten Daten zu erhalten</li>
              <li>Berichtigung unrichtiger Daten zu verlangen</li>
              <li>Löschung Ihrer Daten zu verlangen</li>
              <li>Einschränkung der Verarbeitung zu verlangen</li>
              <li>Der Verarbeitung zu widersprechen</li>
              <li>Datenübertragbarkeit zu verlangen</li>
            </ul>
            <p className="text-[var(--text-secondary)] mt-4">
              Da wir keine personenbezogenen Daten auf unseren Servern speichern, betrifft dies
              hauptsächlich die Daten, die beim Hosting-Anbieter anfallen können.
            </p>
          </section>

          <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              8. Beschwerderecht
            </h2>
            <p className="text-[var(--text-secondary)]">
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung
              Ihrer personenbezogenen Daten zu beschweren.
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
