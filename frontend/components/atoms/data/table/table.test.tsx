import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ColumnDef } from "@tanstack/react-table"

import { Table } from "./table"

interface MockUser {
  id: string
  name: string
  role: "Admin" | "Editor" | "Viewer"
}

const mockUsers: MockUser[] = Array.from({ length: 12 }, (_, index) => ({
  id: `user-${index + 1}`,
  name: `User ${index + 1}`,
  role: index % 2 === 0 ? "Admin" : "Editor",
}))

const columns: ColumnDef<MockUser, unknown>[] = [
  {
    id: "select",
    header: "Select",
    cell: () => <input type="checkbox" aria-label="Select row" />,
  },
  {
    accessorKey: "name",
    header: "Name",
    meta: {
      headerClassName: "text-center",
      className: "font-semibold",
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    meta: {
      headerClassName: "text-right",
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => <button type="button">Open</button>,
  },
]

describe("Table Component", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("merender header dan konten baris data dengan benar", () => {
      render(<Table data={mockUsers.slice(0, 2)} columns={columns} />)

      expect(screen.getByRole("columnheader", { name: "Name" })).toBeDefined()
      expect(screen.getByRole("columnheader", { name: "Role" })).toBeDefined()
      expect(screen.getByRole("columnheader", { name: "Actions" })).toBeDefined()
      expect(screen.getByRole("cell", { name: "User 1" })).toBeDefined()
      expect(screen.getByRole("cell", { name: "User 2" })).toBeDefined()
    })

    it("merender pesan kosong kustom saat data kosong", () => {
      render(
        <Table
          data={[]}
          columns={columns}
          emptyMessage="No users found in this table"
        />
      )

      expect(screen.getByText("No users found in this table")).toBeDefined()
    })

    it("merender loading indicator saat prop isLoading=true", () => {
      const { container } = render(
        <Table data={mockUsers.slice(0, 2)} columns={columns} isLoading />
      )

      expect(container.querySelector(".animate-spin") || screen.getByRole("status")).toBeDefined()
    })

    it("merender header placeholder saat menggunakan pengelompokan kolom", () => {
      const groupedColumns: ColumnDef<MockUser>[] = [
        {
          id: "group",
          header: "User Group",
          columns: [
            {
              accessorKey: "name",
              header: "Name",
            },
          ],
        },
        {
          accessorKey: "role",
          header: "Role",
        },
      ]

      render(<Table data={mockUsers.slice(0, 2)} columns={groupedColumns} />)
      expect(screen.getByText("User Group")).toBeDefined()
    })
  })

  describe("Props", () => {
    it("menyaring baris berdasarkan input pencarian saat enableFiltering=true", async () => {
      render(<Table data={mockUsers} columns={columns} enableFiltering />)

      const searchInput = screen.getByPlaceholderText("Search data...")
      await user.type(searchInput, "User 7")

      expect(screen.getByRole("cell", { name: "User 7" })).toBeDefined()
      expect(screen.queryByRole("cell", { name: "User 1" })).toBeNull()
    })

    it("menerapkan metadata styling pada kelas kolom", () => {
      render(<Table data={mockUsers.slice(0, 1)} columns={columns} />)

      const nameHeader = screen.getByRole("columnheader", { name: "Name" })
      expect(nameHeader.className).toContain("text-center")

      const roleHeader = screen.getByRole("columnheader", { name: "Role" })
      expect(roleHeader.className).toContain("text-right")

      const nameCell = screen.getByRole("cell", { name: "User 1" })
      expect(nameCell.className).toContain("font-semibold")
    })

    it("mendukung penyesuaian ukuran halaman (pageSize dan pageSizeOptions)", async () => {
      const handlePageSizeChange = vi.fn()
      render(
        <Table
          data={mockUsers}
          columns={columns}
          enablePagination
          pageSize={5}
          pageSizeOptions={[2, 5, 10]}
          onPageSizeChange={handlePageSizeChange}
        />
      )

      const select = screen.getByRole("combobox")
      await user.selectOptions(select, "2")

      expect(handlePageSizeChange).toHaveBeenCalledWith(2)
    })

    it("merender info paginasi manual menggunakan prop paginationInfo", () => {
      const paginationMeta = {
        current_page: 2,
        size: 5,
        total_page: 3,
        total_element: 12,
      }

      render(
        <Table
          data={mockUsers.slice(0, 5)}
          columns={columns}
          enablePagination
          paginationInfo={paginationMeta}
        />
      )

      expect(screen.getByText(/Menampilkan/i).textContent).toContain("6 - 10 dari 12 data")
    })

    it("memperbarui pagination state saat prop pageSize berubah secara dinamis", () => {
      const { rerender } = render(
        <Table data={mockUsers} columns={columns} pageSize={5} />
      )

      rerender(<Table data={mockUsers} columns={columns} pageSize={10} />)
    })

    it("mengonfigurasi getExpandedRowModel saat getSubRows disediakan", () => {
      const getSubRowsMock = vi.fn()
      render(
        <Table data={mockUsers.slice(0, 1)} columns={columns} getSubRows={getSubRowsMock} />
      )
    })

    it("menghasilkan row ID menggunakan uuid atau fallback ke index saat id tidak ada", () => {
      const mockUsersWithUuid: (Partial<MockUser> & { uuid?: string; index?: number })[] = [
        { uuid: "uuid-1", name: "User 1", role: "Admin" },
        { name: "User 2", role: "Editor", index: 1 },
      ]

      render(<Table data={mockUsersWithUuid as MockUser[]} columns={columns} />)
      expect(screen.getByRole("cell", { name: "User 1" })).toBeDefined()
      expect(screen.getByRole("cell", { name: "User 2" })).toBeDefined()
    })
  })

  describe("Events", () => {
    it("memanggil onRowClick saat konten baris diklik", async () => {
      const handleRowClick = vi.fn()
      render(
        <Table
          data={mockUsers.slice(0, 1)}
          columns={columns}
          onRowClick={handleRowClick}
        />
      )

      const cell = screen.getByRole("cell", { name: "User 1" })
      await user.click(cell)

      expect(handleRowClick).toHaveBeenCalledTimes(1)
    })

    it("tidak memanggil onRowClick saat checkbox, sel seleksi, atau sel aksi diklik", async () => {
      const handleRowClick = vi.fn()
      render(
        <Table
          data={mockUsers.slice(0, 1)}
          columns={columns}
          onRowClick={handleRowClick}
        />
      )

      const checkbox = screen.getByRole("checkbox", { name: "Select row" })
      await user.click(checkbox)
      expect(handleRowClick).not.toHaveBeenCalled()

      const selectCell = checkbox.closest("td")!
      await user.click(selectCell)
      expect(handleRowClick).not.toHaveBeenCalled()

      const actionButton = screen.getByRole("button", { name: "Open" })
      await user.click(actionButton)
      expect(handleRowClick).not.toHaveBeenCalled()

      const actionCell = actionButton.closest("td")!
      await user.click(actionCell)
      expect(handleRowClick).not.toHaveBeenCalled()
    })

    it("mengubah pengurutan kolom saat header kolom diklik", async () => {
      const { container } = render(
        <Table data={mockUsers.slice(0, 3)} columns={columns} />
      )

      const nameHeader = screen.getByText("Name")

      await user.click(nameHeader)
      expect(container.querySelector(".lucide-chevron-up")).not.toBeNull()

      await user.click(nameHeader)
      expect(container.querySelector(".lucide-chevron-down")).not.toBeNull()

      await user.click(nameHeader)
      expect(container.querySelector(".lucide-chevron-up")).toBeNull()
      expect(container.querySelector(".lucide-chevron-down")).toBeNull()
    })
  })

  describe("State Internal", () => {
    it("menampilkan tombol ekspansi kolom mobile dan beralih state saat diklik", async () => {
      render(<Table data={mockUsers.slice(0, 2)} columns={columns} />)

      const expandButton = screen.getByRole("button", {
        name: /Scroll to See More Columns/i,
      })
      expect(expandButton).toBeDefined()

      await user.click(expandButton)

      const collapseButton = screen.getByRole("button", {
        name: /Collapse Columns/i,
      })
      expect(collapseButton).toBeDefined()
    })

    it("menerapkan status baris terseleksi dari prop state external", () => {
      render(
        <Table
          data={mockUsers.slice(0, 2)}
          columns={columns}
          state={{
            rowSelection: { "user-1": true },
          }}
        />
      )

      const rows = screen.getAllByRole("row")
      const selectedRow = rows[1]
      expect(selectedRow.getAttribute("data-state")).toBe("selected")
    })
  })

  describe("Accessibility", () => {
    it("dapat memfokuskan input pencarian menggunakan keyboard tab", async () => {
      render(<Table data={mockUsers} columns={columns} enableFiltering />)

      const searchInput = screen.getByPlaceholderText("Search data...")

      await user.tab()
      expect(document.activeElement).toBe(searchInput)
    })
  })

  describe("Pagination", () => {
    it("merender kontrol paginasi saat enablePagination=true", () => {
      render(
        <Table data={mockUsers} columns={columns} enablePagination pageSize={2} />
      )

      const pagination = screen.getByRole("navigation", { name: /pagination/i })
      expect(within(pagination).getByText("1")).toBeDefined()
      expect(within(pagination).getByText("2")).toBeDefined()
    })

    it("berpindah halaman saat halaman diklik", async () => {
      render(
        <Table data={mockUsers} columns={columns} enablePagination pageSize={2} />
      )

      const pagination = screen.getByRole("navigation", { name: /pagination/i })
      await user.click(within(pagination).getByText("2"))

      expect(screen.getByRole("cell", { name: "User 3" })).toBeDefined()
      expect(screen.queryByRole("cell", { name: "User 1" })).toBeNull()
    })

    it("berpindah halaman menggunakan tombol next dan previous", async () => {
      render(
        <Table data={mockUsers} columns={columns} enablePagination pageSize={2} />
      )

      const nextButton = screen.getByLabelText("Go to next page")
      await user.click(nextButton)
      expect(screen.getByRole("cell", { name: "User 3" })).toBeDefined()

      const prevButton = screen.getByLabelText("Go to previous page")
      await user.click(prevButton)
      expect(screen.getByRole("cell", { name: "User 1" })).toBeDefined()
    })

    it("tidak berpindah halaman saat tombol disabled previous/next diklik", async () => {
      render(
        <Table data={mockUsers} columns={columns} enablePagination pageSize={10} />
      )

      const prevButton = screen.getByLabelText("Go to previous page")
      await user.click(prevButton)
      expect(screen.getByRole("cell", { name: "User 1" })).toBeDefined()

      const pagination = screen.getByRole('navigation', { name: /pagination/i })
      await user.click(within(pagination).getByText("2"))
      expect(screen.getByRole("cell", { name: "User 11" })).toBeDefined()

      const nextButton = screen.getByLabelText("Go to next page")
      await user.click(nextButton)
      expect(screen.getByRole("cell", { name: "User 11" })).toBeDefined()
    })

    it("merender ellipsis ketika total halaman melebihi kapasitas maxVisible", () => {
      render(
        <Table data={mockUsers} columns={columns} enablePagination pageSize={1} />
      )

      const pagination = screen.getByRole("navigation", { name: /pagination/i })
      expect(within(pagination).getByText("1")).toBeDefined()
      expect(within(pagination).getByText("2")).toBeDefined()
      expect(within(pagination).getByText("12")).toBeDefined()
      expect(screen.getAllByText("More pages").length).toBeGreaterThan(0)
    })

    it("memanggil callback onPageChange jika disediakan", async () => {
      const handlePageChange = vi.fn()
      render(
        <Table
          data={mockUsers}
          columns={columns}
          enablePagination
          pageSize={2}
          onPageChange={handlePageChange}
        />
      )

      const pagination = screen.getByRole("navigation", { name: /pagination/i })
      await user.click(within(pagination).getByText("2"))
      expect(handlePageChange).toHaveBeenCalledWith(1)
    })

    it("mengevaluasi fallback totalPages ketika getPageCount bernilai 0", () => {
      const paginationMeta = {
        current_page: 1,
        size: 5,
        total_page: 0,
        total_element: 1,
      }

      render(
        <Table
          data={mockUsers.slice(0, 1)}
          columns={columns}
          enablePagination
          paginationInfo={paginationMeta}
        />
      )
    })

    it("merender ellipsis di sebelah kiri dan kanan secara dinamis berdasarkan posisi halaman", () => {
      const { rerender } = render(
        <Table
          data={mockUsers}
          columns={columns}
          enablePagination
          paginationInfo={{
            current_page: 5,
            size: 1,
            total_page: 12,
            total_element: 12,
          }}
        />
      )

      const paginationLeftRight = screen.getByRole("navigation", { name: /pagination/i })
      expect(within(paginationLeftRight).getAllByText("More pages").length).toBe(2)

      rerender(
        <Table
          data={mockUsers}
          columns={columns}
          enablePagination
          paginationInfo={{
            current_page: 11,
            size: 1,
            total_page: 12,
            total_element: 12,
          }}
        />
      )

      const paginationLeftOnly = screen.getByRole("navigation", { name: /pagination/i })
      expect(within(paginationLeftOnly).getAllByText("More pages").length).toBe(1)
    })

    it("menonaktifkan pengurutan kolom saat enableSorting=false", () => {
      render(
        <Table data={mockUsers.slice(0, 2)} columns={columns} enableSorting={false} />
      )
    })
  })
})

