interface Props {
  decision: string;
}

const ALERTS: Record<string, { className: string; text: string }> = {
  blocked: {
    className: "guardrail-alert guardrail-blocked",
    text: "This request was blocked by the jailbreak guardrail.",
  },
  "pii-flagged": {
    className: "guardrail-alert guardrail-pii",
    text: "PII detected. The model was instructed to ignore personal information.",
  },
};

export function GuardrailAlert({ decision }: Props) {
  const alert = ALERTS[decision];
  if (!alert) return null;
  return <div className={alert.className}>{alert.text}</div>;
}
