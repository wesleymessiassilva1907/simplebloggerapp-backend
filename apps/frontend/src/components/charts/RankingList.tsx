'use client';

interface RankingItem {
  name: string;
  value: string | number;
  subtitle?: string;
  percent?: number;
}

interface RankingListProps {
  items: RankingItem[];
  title: string;
  maxItems?: number;
}

export default function RankingList({ items, title, maxItems = 5 }: RankingListProps) {
  const displayed = items.slice(0, maxItems);

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{title}</h3>
      <div className="space-y-3">
        {displayed.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm py-4 text-center">Sem dados</p>
        ) : (
          displayed.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] ml-2">{item.value}</p>
                </div>
                {item.subtitle && (
                  <p className="text-xs text-[var(--text-muted)]">{item.subtitle}</p>
                )}
                {item.percent !== undefined && (
                  <div className="mt-1 w-full bg-[var(--bg-tertiary)] rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-brand-500 to-violet-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(item.percent, 100)}%` }} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
