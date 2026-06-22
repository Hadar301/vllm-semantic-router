interface Props {
  decision: string | null;
  onClick?: () => void;
}

const DECISION_COLORS: Record<string, string> = {
  research: "badge-research",
  rag: "badge-rag",
  general: "badge-general",
  blocked: "badge-blocked",
  "pii-flagged": "badge-pii",
};

export function RoutingBadge({ decision, onClick }: Props) {
  if (!decision) return null;
  const className = `routing-badge ${DECISION_COLORS[decision] || "badge-general"}`;
  return (
    <button className={className} onClick={onClick} type="button">
      {decision}
    </button>
  );
}
