import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GuardrailAlert } from "../src/components/GuardrailAlert";

describe("GuardrailAlert", () => {
  it("renders blocked alert", () => {
    render(<GuardrailAlert decision="blocked" />);
    expect(screen.getByText(/blocked by the jailbreak guardrail/)).toBeInTheDocument();
  });

  it("renders pii-flagged alert", () => {
    render(<GuardrailAlert decision="pii-flagged" />);
    expect(screen.getByText(/PII detected/)).toBeInTheDocument();
  });

  it("renders nothing for unknown decision", () => {
    const { container } = render(<GuardrailAlert decision="general" />);
    expect(container.firstChild).toBeNull();
  });

  it("applies correct class for blocked", () => {
    render(<GuardrailAlert decision="blocked" />);
    const el = screen.getByText(/blocked by the jailbreak guardrail/);
    expect(el.className).toContain("guardrail-blocked");
  });

  it("applies correct class for pii", () => {
    render(<GuardrailAlert decision="pii-flagged" />);
    const el = screen.getByText(/PII detected/);
    expect(el.className).toContain("guardrail-pii");
  });
});
