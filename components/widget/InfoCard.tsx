// Inline info card, shown under a bot message for things like visit/address
// details. Presentation-only — a directions link renders separately, so this
// card carries no button of its own.

type InfoCardProps = {
  title: string;
  lines: string[];
};

export function InfoCard({ title, lines }: InfoCardProps) {
  return (
    <div className="animate-concierge-card-in w-full rounded-lg border border-charcoal/12 bg-offwhite p-4 shadow-[0_1px_2px_rgba(23,22,19,0.04),0_8px_20px_rgba(23,22,19,0.06)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-copper">{title}</p>

      <div className="mt-2 flex flex-col gap-1">
        {lines.map((line, i) => (
          <p key={i} className="text-[13px] text-charcoal">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
