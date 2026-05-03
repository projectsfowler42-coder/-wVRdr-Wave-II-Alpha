export type PageKey = 'cockpit' | 'mdk' | 'ftysk' | 'holoDeck' | 'settings';

export type PageDefinition = {
  key: PageKey;
  label: string;
  doctrine: string;
};

type PageShellProps = {
  activePage: PageKey;
  onPageChange: (page: PageKey) => void;
};

export const PAGES: PageDefinition[] = [
  { key: 'cockpit', label: 'Cockpit', doctrine: 'Cockpit shows truth.' },
  { key: 'mdk', label: 'MDK', doctrine: 'MDK validates, routes, stores, guards, and certifies truth.' },
  { key: 'ftysk', label: 'FTySK', doctrine: 'FTySK explains what matters now.' },
  { key: 'holoDeck', label: 'Holo-Deck', doctrine: 'Holo-Deck tests judgment under constraints.' },
  { key: 'settings', label: 'Settings', doctrine: 'Settings protects sovereignty, config, and audit gates.' },
];

export function PageShell({ activePage, onPageChange }: PageShellProps) {
  return (
    <nav className="page-shell" aria-label="Top-level Wave-II Alpha pages">
      {PAGES.map((page) => (
        <button
          type="button"
          className={page.key === activePage ? 'page-tab active' : 'page-tab'}
          key={page.key}
          onClick={() => onPageChange(page.key)}
          aria-pressed={page.key === activePage}
          title={page.doctrine}
        >
          <span>{page.label}</span>
          <small>{page.doctrine}</small>
        </button>
      ))}
    </nav>
  );
}
