
import { useTheme } from "next-themes"
// import EmojiPicker from "emoji-picker-react"

import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { EmojiReactionPicker } from "./emoji-reaction-picker"

vi.mock("next-themes", () => ({
  useTheme: vi.fn(() => ({ resolvedTheme: "light" })),
}))

vi.mock("emoji-picker-react", () => ({
  default: vi.fn(({ onEmojiClick }: {
    onEmojiClick: (data: { emoji: string }) => void
  }) => (
    <div data-testid="emoji-picker">
      <button
        type="button"
        onClick={() => onEmojiClick({ emoji: "😀" })}
      >
        😀
      </button>
      <button
        type="button"
        onClick={() => onEmojiClick({ emoji: "❤️" })}
      >
        ❤️
      </button>
    </div>
  )),
  Theme: {
    DARK: "dark",
    LIGHT: "light",
  },
}))

describe("EmojiReactionPicker", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()

    vi.mocked(useTheme).mockReturnValue({
      resolvedTheme: "light",
      theme: "light",
      setTheme: vi.fn(),
      themes: [],
      systemTheme: "light",
      forcedTheme: undefined,
    })
  })

  describe("Rendering", () => {
    it("merender trigger button dengan icon SmilePlus", () => {
      render(<EmojiReactionPicker onSelect={vi.fn()} />)

      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("tidak menampilkan emoji picker sebelum trigger diklik", () => {
      render(<EmojiReactionPicker onSelect={vi.fn()} />)

      expect(screen.queryByTestId("emoji-picker")).not.toBeInTheDocument()
    })

    it("menampilkan emoji picker setelah trigger diklik", async () => {
      render(<EmojiReactionPicker onSelect={vi.fn()} />)

      await user.click(screen.getByRole("button"))

      expect(screen.getByTestId("emoji-picker")).toBeInTheDocument()
    })
  })

  describe("Props", () => {
    it("menerapkan className pada trigger button", () => {
      render(
        <EmojiReactionPicker onSelect={vi.fn()} className="custom-class" />
      )

      expect(screen.getByRole("button").className).toContain("custom-class")
    })
  })

  describe("Events", () => {
    it("memanggil onSelect dengan emoji yang dipilih", async () => {
      const onSelect = vi.fn()
      render(<EmojiReactionPicker onSelect={onSelect} />)

      await user.click(screen.getByRole("button"))
      await user.click(screen.getByRole("button", { name: "😀" }))

      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect).toHaveBeenCalledWith("😀")
    })

    it("memanggil onSelect dengan emoji yang berbeda sesuai pilihan", async () => {
      const onSelect = vi.fn()
      render(<EmojiReactionPicker onSelect={onSelect} />)

      await user.click(screen.getByRole("button"))
      await user.click(screen.getByRole("button", { name: "❤️" }))

      expect(onSelect).toHaveBeenCalledWith("❤️")
    })

    it("hanya memanggil onSelect sekali per klik emoji", async () => {
      const onSelect = vi.fn()
      render(<EmojiReactionPicker onSelect={onSelect} />)

      await user.click(screen.getByRole("button"))
      await user.click(screen.getByRole("button", { name: "😀" }))

      expect(onSelect).toHaveBeenCalledTimes(1)
    })
  })

  // describe("Integration", () => {
  //   it("meneruskan theme LIGHT ke EmojiPicker saat tema light aktif", async () => {
  //     vi.mocked(useTheme).mockReturnValue({
  //       resolvedTheme: "light",
  //       theme: "light",
  //       setTheme: vi.fn(),
  //       themes: [],
  //       systemTheme: "light",
  //       forcedTheme: undefined,
  //     })

  //     render(<EmojiReactionPicker onSelect={vi.fn()} />)
  //     await user.click(screen.getByRole("button"))

  //     expect(vi.mocked(EmojiPicker)).toHaveBeenCalledWith(
  //       expect.objectContaining({ theme: "light" }),
  //       expect.anything()
  //     )
  //   })

  //   it("meneruskan theme DARK ke EmojiPicker saat tema dark aktif", async () => {
  //     vi.mocked(useTheme).mockReturnValue({
  //       resolvedTheme: "dark",
  //       theme: "dark",
  //       setTheme: vi.fn(),
  //       themes: [],
  //       systemTheme: "dark",
  //       forcedTheme: undefined,
  //     })

  //     render(<EmojiReactionPicker onSelect={vi.fn()} />)
  //     await user.click(screen.getByRole("button"))

  //     expect(vi.mocked(EmojiPicker)).toHaveBeenCalledWith(
  //       expect.objectContaining({ theme: "dark" }),
  //       expect.anything()
  //     )
  //   })
  // })

  describe("Accessibility", () => {
    it("trigger button dapat difokuskan melalui keyboard", async () => {
      render(<EmojiReactionPicker onSelect={vi.fn()} />)

      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("button"))
    })

    // it("menampilkan tooltip 'Add reaction' saat trigger difokuskan", async () => {
    //   render(<EmojiReactionPicker onSelect={vi.fn()} />)

    //   await user.tab()

    //   expect(await screen.findByText("Add reaction")).toBeInTheDocument()
    // })

    it("emoji picker dapat dibuka melalui keyboard Enter", async () => {
      render(<EmojiReactionPicker onSelect={vi.fn()} />)

      await user.tab()
      await user.keyboard("{Enter}")

      expect(screen.getByTestId("emoji-picker")).toBeInTheDocument()
    })
  })
})