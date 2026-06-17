import React from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { FileX } from 'lucide-react'
import { EmptyItem } from "./empty-item"

describe("Empty Item Component", () => {

  describe("Rendering", () => {
    const description = "No content available"

    it("renders description text when provided", () => {
      render(<EmptyItem description={description} />)

      expect(screen.getByText(description)).toBeInTheDocument()
    })

    // it("render 2 images in light and dark theme", () => {
    //   render(<EmptyItem description={description} />)

    //   expect(screen.getAllByAltText("Empty Item Image")).toHaveLength(2)
    // })

    it("not render title when title prop is not provided", () => {
      render(<EmptyItem description={description} />)

      expect(screen.queryByRole("heading")).not.toBeInTheDocument()
    })
  })

  describe("Props", () => {
    const title = "Empty State"
    const description = "No content available"

    it("render title when title prop is provided", () => {
      render(<EmptyItem title={title} description={description} />)

      expect(screen.getByText(title)).toBeInTheDocument()
    })

    it("render action button when onAction and actionLabel props are provided", () => {
      render(
        <EmptyItem 
          description={description}
          actionLabel="Retry"
          onAction={vi.fn()}
        />
      )

      expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument()
    })

    it("not render action button when only actionLabel prop is provided without onAction", () => {
      render(
        <EmptyItem 
          description={description}
          actionLabel="Coba Lagi Wir"
        />
      )

      expect(screen.queryByRole("button", { name: "Coba Lagi Wir" })).not.toBeInTheDocument()
    })

    it("tidak merender action button jika hanya onAction yang diberikan tanpa actionLabel", () => {
      render(<EmptyItem description="Kosong" onAction={vi.fn()} />)
 
      expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })
 
    it("merender icon di dalam action button jika prop icon diberikan", () => {
      render(
        <EmptyItem
          description="Kosong"
          actionLabel="Buat Baru"
          onAction={vi.fn()}
          icon={FileX}
        />
      )
 
      const button = screen.getByRole("button", { name: /buat baru/i })
      expect(button.querySelector("svg")).toBeInTheDocument()
    })

    it("tidak merender icon jika prop icon tidak diberikan", () => {
      render(
        <EmptyItem
          description="Kosong"
          actionLabel="Buat Baru"
          onAction={vi.fn()}
        />
      )
 
      const button = screen.getByRole("button", { name: "Buat Baru" })
      expect(button.querySelector("svg")).not.toBeInTheDocument()
    })
 
    it("menerapkan className pada wrapper", () => {
      const { container } = render(
        <EmptyItem description="Kosong" className="custom-empty" />
      )
 
      expect(container.firstElementChild?.className).toContain("custom-empty")
    })
  })

  describe("Events", () => {
    it("memanggil onAction saat action button diklik", async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(
        <EmptyItem
          description="Kosong"
          actionLabel="Buat Baru"
          onAction={onAction}
        />
      )
 
      await user.click(screen.getByRole("button", { name: "Buat Baru" }))
 
      expect(onAction).toHaveBeenCalledTimes(1)
    })
  })

  describe("Accessibility", () => {
    it("action button dapat difokuskan melalui keyboard", async () => {
      const user = userEvent.setup()
      render(
        <EmptyItem
          description="Kosong"
          actionLabel="Buat Baru"
          onAction={vi.fn()}
        />
      )
 
      await user.tab()
 
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Buat Baru" })
      )
    })

    it("action button dapat diaktifkan melalui keyboard Enter", async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(
        <EmptyItem
          description="Kosong"
          actionLabel="Buat Baru"
          onAction={onAction}
        />
      )
 
      await user.tab()
      await user.keyboard("{Enter}")
 
      expect(onAction).toHaveBeenCalledTimes(1)
    })

    it("gambar ilustrasi memiliki alt text yang deskriptif", () => {
      render(<EmptyItem description="Kosong" />)
 
      const images = screen.getAllByAltText("No Data State")
      expect(images).toHaveLength(2)
      images.forEach((img) => {
        expect(img).toHaveAttribute("alt", "No Data State")
      })
    })
  })
})