import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RoutingSidebar } from "../src/components/RoutingSidebar";
import type { RoutingMetadata } from "../src/types/chat";

describe("RoutingSidebar", () => {
  it("shows empty state when metadata is undefined", () => {
    render(<RoutingSidebar metadata={undefined} />);
    expect(screen.getByText("Select a message to see routing details.")).toBeInTheDocument();
  });

  it("renders decision name", () => {
    const metadata: RoutingMetadata = {
      selected_decision: "research",
      selected_model: "research-agent",
      selected_confidence: null,
      signal_confidences: null,
      matched_signals: null,
      recommended_models: null,
      routing_decision: null,
    };
    render(<RoutingSidebar metadata={metadata} />);
    expect(screen.getByText("research")).toBeInTheDocument();
  });

  it("renders model name", () => {
    const metadata: RoutingMetadata = {
      selected_decision: null,
      selected_model: "general-agent",
      selected_confidence: null,
      signal_confidences: null,
      matched_signals: null,
      recommended_models: null,
      routing_decision: null,
    };
    render(<RoutingSidebar metadata={metadata} />);
    expect(screen.getByText("general-agent")).toBeInTheDocument();
  });

  it("renders confidence bar", () => {
    const metadata: RoutingMetadata = {
      selected_decision: "research",
      selected_model: null,
      selected_confidence: 0.95,
      signal_confidences: null,
      matched_signals: null,
      recommended_models: null,
      routing_decision: null,
    };
    render(<RoutingSidebar metadata={metadata} />);
    expect(screen.getByText("95%")).toBeInTheDocument();
  });

  it("renders signal confidences", () => {
    const metadata: RoutingMetadata = {
      selected_decision: null,
      selected_model: null,
      selected_confidence: null,
      signal_confidences: { "domain:computer science": 0.987, "complexity:high": 0.65 },
      matched_signals: null,
      recommended_models: null,
      routing_decision: null,
    };
    render(<RoutingSidebar metadata={metadata} />);
    expect(screen.getByText("domain:computer science")).toBeInTheDocument();
    expect(screen.getByText("99%")).toBeInTheDocument();
    expect(screen.getByText("65%")).toBeInTheDocument();
  });

  it("renders matched signals", () => {
    const metadata: RoutingMetadata = {
      selected_decision: null,
      selected_model: null,
      selected_confidence: null,
      signal_confidences: null,
      matched_signals: { domains: ["computer science"], keywords: ["document-terms"] },
      recommended_models: null,
      routing_decision: null,
    };
    render(<RoutingSidebar metadata={metadata} />);
    expect(screen.getByText("domains")).toBeInTheDocument();
    expect(screen.getByText("computer science")).toBeInTheDocument();
    expect(screen.getByText("document-terms")).toBeInTheDocument();
  });

  it("shows dash for missing decision and model", () => {
    const metadata: RoutingMetadata = {
      selected_decision: null,
      selected_model: null,
      selected_confidence: null,
      signal_confidences: null,
      matched_signals: null,
      recommended_models: null,
      routing_decision: null,
    };
    render(<RoutingSidebar metadata={metadata} />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });
});
