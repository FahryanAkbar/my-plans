import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
} from "./dropdown-menu"

function TestDropdown({
	onSelect = vi.fn(),
	disabled = false,
}: { onSelect?: (v: string) => void; disabled?: boolean } = {}) {
	return (
    <DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button disabled={disabled}>Open</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuItem onClick={() => onSelect?.("one")}>One</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onSelect?.("two")}>Two</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

describe("Dropdown Menu Component", () => {
	let user: ReturnType<typeof userEvent.setup>

	beforeEach(() => {
		user = userEvent.setup()
		vi.clearAllMocks()
	})

	describe("Rendering", () => {
		it("renders trigger button", () => {
			render(<TestDropdown />)

			expect(screen.getByRole("button", { name: /open/i })).toBeInTheDocument()
		})

		it("does not show menu items initially", () => {
			render(<TestDropdown />)

			expect(screen.queryByText("One")).toBeNull()
			expect(screen.queryByText("Two")).toBeNull()
		})
	})

	describe("Props", () => {
		it("disabled trigger prevents opening and selection", async () => {
			const onSelect = vi.fn()
			render(<TestDropdown onSelect={onSelect} disabled />)

			const btn = screen.getByRole("button", { name: /open/i })
			expect(btn).toBeDisabled()

			await user.click(btn)

			expect(onSelect).not.toHaveBeenCalled()
		})
	})

	describe("Events", () => {
		it("opens menu and calls onSelect when item clicked", async () => {
			const onSelect = vi.fn()
			render(<TestDropdown onSelect={onSelect} />)

			await user.click(screen.getByRole("button", { name: /open/i }))

			expect(await screen.findByText("One")).toBeInTheDocument()

			await user.click(screen.getByText("One"))

			expect(onSelect).toHaveBeenCalledTimes(1)
			expect(onSelect).toHaveBeenCalledWith("one")

			await waitFor(() => {
				expect(screen.queryByText("One")).toBeNull()
			})
		})
	})

	describe("State Internal", () => {
		it("closes on Escape key", async () => {
			render(<TestDropdown />)

			await user.click(screen.getByRole("button", { name: /open/i }))
			expect(await screen.findByText("One")).toBeInTheDocument()

			await user.keyboard("{Escape}")

			await waitFor(() => {
				expect(screen.queryByText("One")).toBeNull()
			})
		})
	})

	describe("Accessibility", () => {
		it("trigger has aria-haspopup attribute set by primitive", () => {
			render(<TestDropdown />)

			const btn = screen.getByRole("button", { name: /open/i })
			expect(btn).toHaveAttribute("aria-haspopup", "menu")
		})

		it("opens menu with keyboard navigation", async () => {
			render(<TestDropdown />)

			await user.tab()
			await user.keyboard("{Enter}")

			expect(await screen.findByRole("menu")).toBeInTheDocument()
		})
	})

	describe("Integration", () => {
		it("coordinates checkbox, radio, label, separator, shortcut and submenu content", async () => {
			render(
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button>Open</button>
					</DropdownMenuTrigger>

					<DropdownMenuContent>
						<DropdownMenuLabel>Label</DropdownMenuLabel>
						<DropdownMenuGroup>
							<DropdownMenuItem>A</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
						<DropdownMenuRadioGroup value="r1">
							<DropdownMenuRadioItem value="r1">R1</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							Command
							<DropdownMenuShortcut>Ctrl+K</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								<DropdownMenuItem>SubItem</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					</DropdownMenuContent>
				</DropdownMenu>
			)

			await user.click(screen.getByRole("button", { name: /open/i }))

			expect(await screen.findByText("Label")).toBeInTheDocument()
			expect(screen.getByRole("menuitemcheckbox", { name: /checked/i })).toHaveAttribute(
				"aria-checked",
				"true"
			)
			expect(screen.getByRole("menuitemradio", { name: /r1/i })).toHaveAttribute(
				"aria-checked",
				"true"
			)
			expect(document.querySelector('[data-slot="dropdown-menu-checkbox-item-indicator"]')).not.toBeNull()
			expect(document.querySelector('[data-slot="dropdown-menu-radio-item-indicator"]')).not.toBeNull()
			expect(document.querySelector('[data-slot="dropdown-menu-separator"]')).not.toBeNull()
			expect(document.querySelector('[data-slot="dropdown-menu-shortcut"]')).not.toBeNull()

			await user.hover(screen.getByRole("menuitem", { name: /more/i }))
			expect(await screen.findByText("SubItem")).toBeInTheDocument()
		})
	})
})

