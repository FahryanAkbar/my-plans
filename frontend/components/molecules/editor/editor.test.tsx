import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Editor } from "./editor"

vi.mock("@/hooks/common", () => ({
  useEditor: () => ({
    editor: {
      document: [{ id: '1', type: 'paragraph', content: 'Hello' }],
    },
    theme: "light",
  }),
}))

vi.mock("@blocknote/mantine", () => ({
  BlockNoteView: vi.fn(({ onChange, editable}: {
    onChange: () => void
    editable?: boolean
  }) => (
    <div
      role="textbox"
      tabIndex={0}
      aria-label="Editor"
      aria-readonly={!editable}
      data-testid="blocknote-view"
      onClick={onChange}
    >
      BlockNoteView
    </div>
  ))
}))

function TestEditor({
  onChange = vi.fn(),
  initialContent,
  editable = true
}: {
  onChange?: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}) {
  return (
    <Editor 
      onChange={onChange}
      initialContent={initialContent}
      editable={editable}
    />
  )
}
describe("Editor Component", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("rendering", () => {
    it("renders editor area", () => {
      render(<TestEditor />)

      expect(screen.getByTestId("blocknote-view")).toBeInTheDocument()
    })
  })

  describe("Props", () => {
    it("renders in read-only when editable prop is false", () => {
      render(<TestEditor editable={false} />)

      expect(screen.getByRole("textbox", {name: "Editor"}))
        .toHaveAttribute("aria-readonly", "true")
    })
  })

  // describe("Events", () => {
  // })

  // describe("State Internal", () => {
  // })

  describe("Integration", () => {
    it("calls onChange with the correct value when content changes", async () => {
      const mockOnChange = vi.fn()
      render(<TestEditor onChange={mockOnChange} />)

      await user.click(screen.getByTestId("blocknote-view"))

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(
        JSON.stringify(
          [{ id: '1', type: 'paragraph', content: 'Hello' }],
          null, 
          2
        )
      )
    })
  })

  describe("Accessibility", () => {
    it("editor area has accessible role for screen readers", async () => {
      render(<TestEditor />)

      await user.tab()

      expect(document.activeElement).toBe(
        screen.getByRole("textbox", { name: "Editor" })
      )
    })
  })
})