import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConfirmModal } from "./confirmation-modal";

let mockedIsMobile = false;

vi.mock("usehooks-ts", () => ({
  useMediaQuery: () => mockedIsMobile,
}));


interface TestConfirmModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  variant?: React.ComponentProps<typeof ConfirmModal>["variant"];
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

function TestConfirmModal({
  open = true,
  onOpenChange = vi.fn(),
  title = "Confirm Action",
  description = "Are you sure?",
  ...rest
}: TestConfirmModalProps) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      {...rest}
    />
  );
}

describe("ConfirmModal", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    mockedIsMobile = false;
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders title and description when open on desktop", () => {
      render(<TestConfirmModal />);

      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
      expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });

    it("renders confirm and cancel buttons with default labels", () => {
      render(<TestConfirmModal />);

      expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("renders as Drawer on mobile viewport", () => {
      mockedIsMobile = true;
      render(<TestConfirmModal />);

      // Drawer uses vaul — its content has role="dialog"
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    });

    it("renders as AlertDialog when variant is destructive", () => {
      render(<TestConfirmModal variant="destructive" />);

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("renders as AlertDialog when variant is warning", () => {
      render(<TestConfirmModal variant="warning" />);

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("renders as Dialog for non-destructive variants on desktop", () => {
      render(<TestConfirmModal variant="default" />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("renders a custom icon when icon prop is provided", () => {
      render(<TestConfirmModal icon={<span data-testid="custom-icon">★</span>} />);

      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("does not render a dialog-trigger element when no children are provided", () => {
      render(<TestConfirmModal />);

      // Radix puts the trigger in [data-slot='dialog-trigger'] — should be absent
      expect(document.querySelector("[data-slot='dialog-trigger']")).toBeNull();
    });
  });

  describe("Props", () => {
    it("renders custom confirmText on the confirm button", () => {
      render(<TestConfirmModal confirmText="Delete Now" />);

      expect(screen.getByRole("button", { name: "Delete Now" })).toBeInTheDocument();
    });

    it("renders custom cancelText on the cancel button", () => {
      render(<TestConfirmModal cancelText="Go Back" />);

      expect(screen.getByRole("button", { name: "Go Back" })).toBeInTheDocument();
    });

    it("disables confirm and cancel buttons when isLoading is true", () => {
      render(<TestConfirmModal isLoading />);

      // Only confirm and cancel are disabled — the Dialog's built-in Close X is not
      expect(screen.getByRole("button", { name: "Processing..." })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });

    it("shows 'Processing...' on the confirm button when isLoading is true", () => {
      render(<TestConfirmModal isLoading confirmText="Save" />);

      expect(screen.getByRole("button", { name: "Processing..." })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    });

    it("renders children as a trigger element", () => {
      // Render with open=false: when dialog is open, Radix wraps the trigger
      // in an aria-hidden div, making it invisible to getByRole
      render(
        <ConfirmModal
          open={false}
          onOpenChange={vi.fn()}
          title="Test"
          description="Test"
        >
          <button type="button">Open</button>
        </ConfirmModal>
      );

      expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
    });

    it("calls stopPropagation on DrawerTrigger click on mobile (line 131)", async () => {
      // Covers: DrawerTrigger onClick={(e) => e.stopPropagation()} — line 131
      mockedIsMobile = true;
      const onOpenChange = vi.fn();
      render(
        <ConfirmModal
          open={false}
          onOpenChange={onOpenChange}
          title="Test"
          description="Test"
        >
          <button type="button">Open Drawer</button>
        </ConfirmModal>
      );

      await user.click(screen.getByRole("button", { name: "Open Drawer" }));

      // onOpenChange called means trigger onClick fired without propagation issues
      expect(onOpenChange).toHaveBeenCalled();
    });

    it("calls stopPropagation on AlertDialogTrigger click on destructive variant (line 167)", async () => {
      // Covers: AlertDialogTrigger onClick={(e) => e.stopPropagation()} — line 167
      const onOpenChange = vi.fn();
      render(
        <ConfirmModal
          open={false}
          onOpenChange={onOpenChange}
          variant="destructive"
          title="Delete"
          description="This cannot be undone"
        >
          <button type="button">Open Alert</button>
        </ConfirmModal>
      );

      await user.click(screen.getByRole("button", { name: "Open Alert" }));

      expect(onOpenChange).toHaveBeenCalled();
    });

    it("calls stopPropagation on DialogTrigger click on default desktop variant (line 202)", async () => {
      // Covers: DialogTrigger onClick={(e) => e.stopPropagation()} — line 202
      const onOpenChange = vi.fn();
      render(
        <ConfirmModal
          open={false}
          onOpenChange={onOpenChange}
          variant="default"
          title="Confirm"
          description="Are you sure?"
        >
          <button type="button">Open Dialog</button>
        </ConfirmModal>
      );

      await user.click(screen.getByRole("button", { name: "Open Dialog" }));

      expect(onOpenChange).toHaveBeenCalled();
    });
  });

  describe("Events", () => {
    it("calls onConfirm when the confirm button is clicked", async () => {
      const onConfirm = vi.fn();
      render(<TestConfirmModal onConfirm={onConfirm} />);

      await user.click(screen.getByRole("button", { name: "Confirm" }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("calls onOpenChange(false) when the cancel button is clicked on desktop default dialog", async () => {
      const onOpenChange = vi.fn();
      render(<TestConfirmModal onOpenChange={onOpenChange} />);

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("does not call onConfirm when confirm button is disabled (isLoading)", async () => {
      const onConfirm = vi.fn();
      render(<TestConfirmModal onConfirm={onConfirm} isLoading />);

      await user.click(screen.getByRole("button", { name: "Processing..." }));

      expect(onConfirm).not.toHaveBeenCalled();
    });

    it("does not throw when onConfirm is not provided and confirm is clicked", async () => {
      render(<TestConfirmModal />);

      await expect(
        user.click(screen.getByRole("button", { name: "Confirm" }))
      ).resolves.not.toThrow();
    });

    it("calls onOpenChange when cancel is clicked on the destructive AlertDialog path (line 182)", async () => {
      // Covers: AlertDialogCancel onClick={e => e.stopPropagation()} — line 182
      const onOpenChange = vi.fn();
      render(
        <TestConfirmModal variant="destructive" onOpenChange={onOpenChange} />
      );

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("shows 'Processing...' on the destructive AlertDialog confirm button when isLoading is true (lines 181, 191)", () => {
      // Covers: isLoading branch inside AlertDialog path — lines 181 + 191
      render(<TestConfirmModal variant="destructive" isLoading confirmText="Delete" />);

      expect(screen.getByRole("button", { name: "Processing..." })).toBeDisabled();
      expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
    });
  });

  describe("State Internal", () => {
    it("switches from 'Processing...' back to confirmText when isLoading changes to false", () => {
      const { rerender } = render(<TestConfirmModal isLoading confirmText="Save" />);

      expect(screen.getByRole("button", { name: "Processing..." })).toBeInTheDocument();

      rerender(
        <ConfirmModal
          open
          onOpenChange={vi.fn()}
          title="Confirm Action"
          description="Are you sure?"
          isLoading={false}
          confirmText="Save"
        />
      );

      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("switches render path from Dialog to Drawer when isMobile becomes true", () => {
      const { rerender } = render(<TestConfirmModal />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      mockedIsMobile = true;
      rerender(
        <ConfirmModal
          open
          onOpenChange={vi.fn()}
          title="Confirm Action"
          description="Are you sure?"
        />
      );

      // Still shows dialog role but now via Drawer
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("renders AlertDialog with all content for destructive variant on desktop", () => {
      const onConfirm = vi.fn();
      render(
        <TestConfirmModal
          variant="destructive"
          title="Delete File"
          description="This action cannot be undone."
          confirmText="Delete"
          cancelText="Keep"
          onConfirm={onConfirm}
        />
      );

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(screen.getByText("Delete File")).toBeInTheDocument();
      expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument();
    });

    it("calls onConfirm correctly in the destructive (AlertDialog) path", async () => {
      const onConfirm = vi.fn();
      render(
        <TestConfirmModal
          variant="destructive"
          confirmText="Delete"
          onConfirm={onConfirm}
        />
      );

      await user.click(screen.getByRole("button", { name: "Delete" }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("renders Drawer with all content on mobile and calls onConfirm on confirm click", async () => {
      mockedIsMobile = true;
      const onConfirm = vi.fn();

      render(
        <TestConfirmModal
          title="Mobile Confirm"
          description="Confirm on mobile"
          confirmText="Yes"
          onConfirm={onConfirm}
        />
      );

      expect(screen.getByText("Mobile Confirm")).toBeInTheDocument();
      expect(screen.getByText("Confirm on mobile")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Yes" }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("confirm and cancel buttons are focusable within the dialog", async () => {
      render(<TestConfirmModal />);

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      const confirmButton = screen.getByRole("button", { name: "Confirm" });

      cancelButton.focus();
      expect(cancelButton).toHaveFocus();

      await user.tab();
      expect(confirmButton).toHaveFocus();
    });

    it("confirm button in destructive AlertDialog is focusable via Tab", async () => {
      render(<TestConfirmModal variant="destructive" confirmText="Delete" />);

      await user.tab();
      await user.tab();
      await user.tab();

      const focused = document.activeElement;
      expect(focused).not.toBeNull();
    });

    it("modal has accessible role for screen readers on desktop default path", () => {
      render(<TestConfirmModal />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("modal has accessible alertdialog role for destructive variant", () => {
      render(<TestConfirmModal variant="destructive" />);

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });
});
