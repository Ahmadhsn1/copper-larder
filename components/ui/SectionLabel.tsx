// Small tracked-uppercase eyebrow label — the one recurring typographic
// device that ties every section's hierarchy together (brief §7/§14/§17/§19).

type SectionLabelProps = {
  children: string;
  tone?: "copper" | "cream" | "olive";
  className?: string;
};

const TONE_CLASS: Record<NonNullable<SectionLabelProps["tone"]>, string> = {
  copper: "text-copper",
  cream: "text-cream/70",
  olive: "text-olive",
};

export function SectionLabel({ children, tone = "copper", className = "" }: SectionLabelProps) {
  return (
    <p
      className={`text-[11px] font-medium uppercase tracking-[0.24em] ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </p>
  );
}
