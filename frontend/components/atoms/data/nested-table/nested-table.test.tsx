import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ColumnDef } from '@tanstack/react-table'
import { NestedTable } from './nested-table'

interface MockTask {
  id: string
  title: string
  assignee: string
  subTasks?: MockTask[]
}

const mockTasks: MockTask[] = [
  {
    id: 'task-1',
    title: 'Design UI layout',
    assignee: 'Alice',
    subTasks: [
      { id: 'task-1-1', title: 'Create mockups', assignee: 'Alice' },
      { id: 'task-1-2', title: 'Export assets', assignee: 'Bob' },
    ],
  },
  {
    id: 'task-2',
    title: 'Setup repository',
    assignee: 'Charlie',
    subTasks: [],
  },
  {
    id: 'task-3',
    title: 'Configure CI/CD pipeline',
    assignee: 'Dave',
  },
]

const columns: ColumnDef<MockTask>[] = [
  {
    accessorKey: 'title',
    header: 'Task Title',
  },
  {
    accessorKey: 'assignee',
    header: 'Assignee',
  },
]

const getSubRows = (row: MockTask) => row.subTasks

describe('NestedTable Component', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('merender header tabel dengan benar', () => {
      render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          enableRowSelection={false}
        />
      )

      expect(screen.getByRole('columnheader', { name: 'Task Title' })).toBeDefined()
      expect(screen.getByRole('columnheader', { name: 'Assignee' })).toBeDefined()
    })

    it('merender baris data utama dengan benar', () => {
      render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          enableRowSelection={false}
        />
      )

      expect(screen.getByRole('cell', { name: 'Design UI layout' })).toBeDefined()
      expect(screen.getByRole('cell', { name: 'Setup repository' })).toBeDefined()
      expect(screen.getByRole('cell', { name: 'Configure CI/CD pipeline' })).toBeDefined()
    })

    it('merender pesan kosong saat data kosong', () => {
      render(
        <NestedTable
          data={[]}
          columns={columns}
          emptyMessage="No tasks found for this view"
        />
      )

      expect(screen.getByRole('cell', { name: 'No tasks found for this view' })).toBeDefined()
    })

    it('merender header placeholder saat menggunakan pengelompokan kolom', () => {
      const groupedColumns: ColumnDef<MockTask>[] = [
        {
          id: 'group',
          header: 'Group Header',
          columns: [
            {
              accessorKey: 'title',
              header: 'Task Title',
            },
          ],
        },
      ]

      render(
        <NestedTable
          data={mockTasks}
          columns={groupedColumns}
          getSubRows={getSubRows}
        />
      )

      expect(screen.getByText('Group Header')).toBeDefined()
    })
  })

  describe('Props', () => {
    it('merender judul komponen hanya pada depth 0', () => {
      render(
        <NestedTable
          title="Project Roadmap"
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
        />
      )

      expect(screen.getByRole('heading', { name: 'Project Roadmap', level: 4 })).toBeDefined()
    })

    it('menyinkronkan dan memfilter data berdasarkan prop externalFilterValue', () => {
      const { rerender } = render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          enableFiltering={true}
          externalFilterValue="CI/CD"
        />
      )

      expect(screen.getByRole('cell', { name: 'Configure CI/CD pipeline' })).toBeDefined()
      expect(screen.queryByRole('cell', { name: 'Design UI layout' })).toBeNull()

      rerender(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          enableFiltering={true}
          externalFilterValue="Setup"
        />
      )

      expect(screen.getByRole('cell', { name: 'Setup repository' })).toBeDefined()
      expect(screen.queryByRole('cell', { name: 'Configure CI/CD pipeline' })).toBeNull()
    })

    it('menyembunyikan checkbox seleksi ketika enableRowSelection=false', () => {
      render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          enableRowSelection={false}
        />
      )

      expect(screen.queryByRole('checkbox', { name: /select/i })).toBeNull()
    })
  })

  describe('Events', () => {
    it('memperluas baris untuk menampilkan sub-baris saat tombol expander diklik', async () => {
      render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          enableRowSelection={true}
        />
      )

      expect(screen.queryByRole('cell', { name: 'Create mockups' })).toBeNull()

      const row = screen.getByRole('cell', { name: 'Design UI layout' }).closest('tr')!
      const expandButton = within(row).getByRole('button')
      
      await user.click(expandButton)

      expect(screen.getByRole('cell', { name: 'Create mockups' })).toBeDefined()
      expect(screen.getByRole('cell', { name: 'Export assets' })).toBeDefined()
    })

    it('memanggil onRowSelectionChange saat checkbox baris diklik', async () => {
      const handleSelectionChange = vi.fn()
      render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          enableRowSelection={true}
          onRowSelectionChange={handleSelectionChange}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox', { name: 'Select row' })
      expect(checkboxes.length).toBeGreaterThan(0)

      await user.click(checkboxes[0])
      expect(handleSelectionChange).toHaveBeenCalledTimes(1)
    })

    it('memilih dan membatalkan pilihan semua baris saat checkbox header diklik', async () => {
      const handleSelectionChange = vi.fn()
      render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          enableRowSelection={true}
          onRowSelectionChange={handleSelectionChange}
        />
      )

      const selectAllCheckbox = screen.getByRole('checkbox', { name: 'Select all' })

      await user.click(selectAllCheckbox)
      expect(handleSelectionChange).toHaveBeenCalled()

      await user.click(selectAllCheckbox)
    })

    it('mengubah pengurutan kolom saat header kolom diklik', async () => {
      const { container } = render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
        />
      )

      const headerText = screen.getByText('Task Title')

      // Klik pertama: mengurutkan secara ascending (asc)
      await user.click(headerText)
      expect(container.querySelector('.lucide-chevron-up')).not.toBeNull()

      // Klik kedua: mengurutkan secara descending (desc)
      await user.click(headerText)
      expect(container.querySelector('.lucide-chevron-down')).not.toBeNull()

      // Klik ketiga: membatalkan pengurutan (none)
      await user.click(headerText)
      expect(container.querySelector('.lucide-chevron-up')).toBeNull()
      expect(container.querySelector('.lucide-chevron-down')).toBeNull()
    })

    it('memperluas baris bersarang beberapa tingkat hingga kedalaman 2 dan tanpa seleksi baris', async () => {
      const nestedTasks: MockTask[] = [
        {
          id: 'task-1',
          title: 'Design UI layout',
          assignee: 'Alice',
          subTasks: [
            {
              id: 'task-1-1',
              title: 'Create mockups',
              assignee: 'Alice',
              subTasks: [
                { id: 'task-1-1-1', title: 'Grandchild task', assignee: 'Bob' },
              ],
            },
          ],
        },
      ]

      render(
        <NestedTable
          data={nestedTasks}
          columns={columns}
          getSubRows={getSubRows}
          enableRowSelection={false}
          maxDepth={2}
        />
      )

      // Kembangkan tingkat 1
      const expandButton1 = screen.getByRole('button')
      await user.click(expandButton1)

      // Kembangkan tingkat 2
      const childRow = screen.getByRole('cell', { name: 'Create mockups' }).closest('tr')!
      const expandButton2 = within(childRow).getByRole('button')
      await user.click(expandButton2)

      // Pastikan tingkat 3 (grandchild) terlihat
      expect(screen.getByRole('cell', { name: 'Grandchild task' })).toBeDefined()
    })
  })

  describe('State Internal', () => {
    it('memfilter baris tabel berdasarkan input pencarian', async () => {
      render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          enableFiltering={true}
          enableRowSelection={false}
        />
      )

      const searchInput = screen.getByPlaceholderText('Search level...')
      expect(searchInput).toBeDefined()

      await user.type(searchInput, 'repository')

      expect(screen.getByRole('cell', { name: 'Setup repository' })).toBeDefined()
      expect(screen.queryByRole('cell', { name: 'Design UI layout' })).toBeNull()
      expect(screen.queryByRole('cell', { name: 'Configure CI/CD pipeline' })).toBeNull()
    })
  })

  describe('Accessibility', () => {
    it('dapat memfokuskan input pencarian menggunakan navigasi keyboard tab', async () => {
      render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          enableFiltering={true}
          enableRowSelection={false}
        />
      )

      const searchInput = screen.getByPlaceholderText('Search level...')

      await user.tab()
      expect(document.activeElement).toBe(searchInput)
    })
  })

  describe('Pagination', () => {
    it('merender kontrol paginasi saat data melebihi ukuran halaman', () => {
      render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          pageSize={1}
        />
      )

      const pagination = screen.getByRole('navigation', { name: /pagination/i })
      expect(within(pagination).getByText('1')).toBeDefined()
      expect(within(pagination).getByText('2')).toBeDefined()
      expect(within(pagination).getByText('3')).toBeDefined()

      expect(screen.getByRole('cell', { name: 'Design UI layout' })).toBeDefined()
      expect(screen.queryByRole('cell', { name: 'Setup repository' })).toBeNull()
    })

    it('berpindah halaman saat halaman diklik', async () => {
      render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          pageSize={1}
        />
      )

      const pagination = screen.getByRole('navigation', { name: /pagination/i })
      await user.click(within(pagination).getByText('2'))

      expect(screen.getByRole('cell', { name: 'Setup repository' })).toBeDefined()
      expect(screen.queryByRole('cell', { name: 'Design UI layout' })).toBeNull()
    })

    it('berpindah halaman menggunakan tombol next dan previous', async () => {
      render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          pageSize={1}
        />
      )

      const nextButton = screen.getByLabelText('Go to next page')
      await user.click(nextButton)
      expect(screen.getByRole('cell', { name: 'Setup repository' })).toBeDefined()

      const prevButton = screen.getByLabelText('Go to previous page')
      await user.click(prevButton)
      expect(screen.getByRole('cell', { name: 'Design UI layout' })).toBeDefined()
    })

    it('tidak memicu perpindahan halaman ketika tombol previous/next dalam keadaan disabled', async () => {
      render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          pageSize={1}
        />
      )

      const prevButton = screen.getByLabelText('Go to previous page')
      await user.click(prevButton)
      expect(screen.getByRole('cell', { name: 'Design UI layout' })).toBeDefined()

      const pagination = screen.getByRole('navigation', { name: /pagination/i })
      await user.click(within(pagination).getByText('3'))
      expect(screen.getByRole('cell', { name: 'Configure CI/CD pipeline' })).toBeDefined()

      const nextButton = screen.getByLabelText('Go to next page')
      await user.click(nextButton)
      expect(screen.getByRole('cell', { name: 'Configure CI/CD pipeline' })).toBeDefined()
    })

    it('merender ellipsis ketika total halaman melebihi kapasitas maxVisible', async () => {
      const moreTasks: MockTask[] = [
        ...mockTasks,
        { id: 'task-4', title: 'Write tests', assignee: 'Eve' },
        { id: 'task-5', title: 'Deploy release', assignee: 'Grace' },
      ]

      render(
        <NestedTable
          data={moreTasks}
          columns={columns}
          getSubRows={getSubRows}
          pageSize={1}
        />
      )

      const pagination = screen.getByRole('navigation', { name: /pagination/i })
      expect(within(pagination).getByText('1')).toBeDefined()
      expect(within(pagination).getByText('2')).toBeDefined()
      expect(within(pagination).getByText('5')).toBeDefined()
      expect(screen.getAllByText('More pages').length).toBeGreaterThan(0)

      await user.click(within(pagination).getByText('2'))
      await user.click(within(pagination).getByText('5'))
    })

    it('tidak merender paginasi ketika enablePagination=false', () => {
      render(
        <NestedTable
          data={mockTasks}
          columns={columns}
          getSubRows={getSubRows}
          pageSize={1}
          enablePagination={false}
        />
      )

      expect(screen.queryByRole('navigation', { name: /pagination/i })).toBeNull()
      expect(screen.queryByText('1')).toBeNull()
      expect(screen.queryByLabelText('Go to next page')).toBeNull()
    })
  })
})
