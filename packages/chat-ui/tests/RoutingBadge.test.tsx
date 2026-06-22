import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RoutingBadge } from "../src/components/RoutingBadge";

describe("RoutingBadge", () => {
  it("renders decision text", () => {
    render(<RoutingBadge decision="research" />);
    expect(screen.getByText("research")).toBeInTheDocument();
  });

  it("renders nothing for null decision", () => {
    const { container } = render(<RoutingBadge decision={null} />);
    expect(container.firstChild).toBeNull();
  });

  it.each([
    ["research", "badge-research"],
    ["rag", "badge-rag"],
    ["general", "badge-general"],
    ["blocked", "badge-blocked"],
    ["pii-flagged", "badge-pii"],
  ])("applies %s class for %s decision", (decision, expectedClass) => {
    render(<RoutingBadge decision={decision} />);
    expect(screen.getByRole("button").className).toContain(expectedClass);
  });

  it("falls back to badge-general for unknown decision", () => {
    render(<RoutingBadge decision="unknown" />);
    expect(screen.getByRole("button").className).toContain("badge-general");
  });

  it("fires onClick", () => {
    const handler = vi.fn();
    render(<RoutingBadge decision="research" onClick={handler} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledOnce();
  });
});
