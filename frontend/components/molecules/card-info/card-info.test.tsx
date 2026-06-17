import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CardInfo } from "./card-info";

function TestCardInfo(props: React.ComponentProps<typeof CardInfo>) {
  return <CardInfo {...props} />;
}

describe("CardInfo", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders nothing when no props are provided", () => {
      render(<TestCardInfo />);

      expect(document.querySelector(".card-info-header")).toBeNull();
      expect(document.querySelector(".card-info-body")).toBeNull();
      expect(document.querySelector(".card-info-actions")).toBeNull();
      expect(document.querySelector(".card-info-footer")).toBeNull();
    });

    it("renders all sections when all props are provided", () => {
      render(
        <TestCardInfo
          icon={<span data-testid="icon">★</span>}
          title="Card Title"
          description="Card Description"
          badges={[{ label: "Badge A" }, { label: "Badge B" }]}
          actions={[{ label: "Save" }, { label: "Cancel" }]}
          footer="Footer text"
        >
          <p>Body content</p>
        </TestCardInfo>
      );

      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card Description")).toBeInTheDocument();
      expect(screen.getByText("Badge A")).toBeInTheDocument();
      expect(screen.getByText("Badge B")).toBeInTheDocument();
      expect(screen.getByText("Body content")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
      expect(screen.getByText("Footer text")).toBeInTheDocument();
    });

    it("renders the header when only icon is provided (no title/description/badges)", () => {
      render(<TestCardInfo icon={<span data-testid="icon-only">◆</span>} />);

      expect(document.querySelector(".card-info-header")).toBeInTheDocument();
      expect(screen.getByTestId("icon-only")).toBeInTheDocument();
    });

    it("renders the header when only badges are provided (no icon/title/description)", () => {
      render(<TestCardInfo badges={[{ label: "Tag" }]} />);

      expect(document.querySelector(".card-info-header")).toBeInTheDocument();
      expect(screen.getByText("Tag")).toBeInTheDocument();
    });

    it("renders a ReactNode footer directly without a Typography wrapper", () => {
      render(
        <TestCardInfo
          footer={<span data-testid="custom-footer">Custom</span>}
        />
      );

      expect(screen.getByTestId("custom-footer")).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("renders an anchor tag with the correct href when action has an href", () => {
      render(
        <TestCardInfo
          actions={[{ label: "Visit", href: "https://example.com" }]}
        />
      );

      expect(screen.getByRole("link", { name: "Visit" })).toHaveAttribute(
        "href",
        "https://example.com"
      );
    });

    it("renders a disabled button when action.disabled is true", () => {
      render(
        <TestCardInfo
          actions={[{ label: "Inactive", disabled: true, onClick: vi.fn() }]}
        />
      );

      expect(screen.getByRole("button", { name: "Inactive" })).toBeDisabled();
    });

    it("adds border-t-0 and bg-transparent classes to footer when hideFooterBorder is true", () => {
      render(<TestCardInfo footer="Footer" hideFooterBorder />);

      const footer = document.querySelector(".card-info-footer");
      expect(footer).toHaveClass("border-t-0", "bg-transparent");
    });

    it("does not add border-t-0 class to footer when hideFooterBorder is false", () => {
      render(<TestCardInfo footer="Footer" hideFooterBorder={false} />);

      const footer = document.querySelector(".card-info-footer");
      expect(footer).not.toHaveClass("border-t-0");
    });
  });

  describe("Events", () => {
    it("calls only the clicked action's onClick and not others", async () => {
      const onSave = vi.fn();
      const onDelete = vi.fn();

      render(
        <TestCardInfo
          actions={[
            { label: "Save", onClick: onSave },
            { label: "Delete", onClick: onDelete },
          ]}
        />
      );

      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onDelete).not.toHaveBeenCalled();
    });

    it("does not call onClick when the action button is disabled", async () => {
      const onClick = vi.fn();

      render(
        <TestCardInfo actions={[{ label: "Inactive", onClick, disabled: true }]} />
      );

      await user.click(screen.getByRole("button", { name: "Inactive" }));

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("State Internal", () => {
    it("renders only body and not header when only children are provided", () => {
      render(
        <TestCardInfo>
          <span>Children only</span>
        </TestCardInfo>
      );

      expect(document.querySelector(".card-info-header")).toBeNull();
      expect(document.querySelector(".card-info-body")).toBeInTheDocument();
    });

    it("renders actions section separately from body when both are provided", () => {
      render(
        <TestCardInfo actions={[{ label: "Action" }]}>
          <p>Body content</p>
        </TestCardInfo>
      );

      expect(document.querySelector(".card-info-body")).toBeInTheDocument();
      expect(document.querySelector(".card-info-actions")).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("renders and orchestrates all atoms together without conflicts", () => {
      const onPrimary = vi.fn();
      const onSecondary = vi.fn();

      render(
        <TestCardInfo
          icon={<span data-testid="int-icon">🔔</span>}
          title="Notification"
          description="An update is available"
          badges={[{ label: "New" }]}
          actions={[
            { label: "Update", onClick: onPrimary },
            { label: "Later", onClick: onSecondary },
          ]}
          footer="v1.2.3"
        />
      );

      expect(screen.getByTestId("int-icon")).toBeInTheDocument();
      expect(screen.getByText("Notification")).toBeInTheDocument();
      expect(screen.getByText("An update is available")).toBeInTheDocument();
      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("v1.2.3")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Later" })).toBeInTheDocument();
    });

    it("each action button only triggers its own callback within a single render", async () => {
      const onUpdate = vi.fn();
      const onLater = vi.fn();

      render(
        <TestCardInfo
          title="Confirm"
          actions={[
            { label: "Update", onClick: onUpdate },
            { label: "Later", onClick: onLater },
          ]}
        />
      );

      await user.click(screen.getByRole("button", { name: "Later" }));

      expect(onLater).toHaveBeenCalledTimes(1);
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("action buttons are reachable via keyboard Tab in order", async () => {
      render(
        <TestCardInfo
          actions={[{ label: "First" }, { label: "Second" }]}
        />
      );

      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "First" })
      );

      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Second" })
      );
    });

    it("link action is focusable via Tab like any interactive element", async () => {
      render(
        <TestCardInfo
          actions={[{ label: "Visit", href: "/destination" }]}
        />
      );

      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByRole("link", { name: "Visit" })
      );
    });
  });
});
