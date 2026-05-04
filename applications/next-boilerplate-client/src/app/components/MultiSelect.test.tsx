'use client'

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MultiSelect } from './MultiSelect'

// #################################################################################################

interface Item {
  id: string
  label: string
}

const ITEMS: Item[] = [
  { id: 'a', label: 'Apple' },
  { id: 'b', label: 'Banana' },
  { id: 'c', label: 'Cherry' },
]

// #################################################################################################

function defaultProps(
  overrides: Partial<Parameters<typeof MultiSelect<Item>>[0]> = {},
) {
  return {
    items: ITEMS,
    placeholder: 'Select fruit',
    searchValue: '',
    selectedIds: [] as string[],
    getId: (item: Item) => item.id,
    getLabel: (item: Item) => item.label,
    onSearchChange: vi.fn(),
    onApply: vi.fn(),
    selectedLabel: (n: number) => `${n} fruit selected`,
    ...overrides,
  }
}

function renderSelect(
  overrides: Partial<Parameters<typeof MultiSelect<Item>>[0]> = {},
) {
  const props = defaultProps(overrides)
  const result = render(<MultiSelect<Item> {...props} />)

  return { ...result, props }
}

// #################################################################################################

describe('MultiSelect — trigger label', () => {
  it('renders placeholder when no selection and selectAllActive is not set', () => {
    renderSelect()
    expect(
      screen.getByRole('button', { name: /Select fruit/ }),
    ).toBeInTheDocument()
  })

  it('renders selectedLabel(N) when selectedIds has N items and selectAllActive is not set', () => {
    renderSelect({ selectedIds: ['a', 'b'] })
    expect(
      screen.getByRole('button', { name: /2 fruit selected/ }),
    ).toBeInTheDocument()
  })

  it('renders allSelectedLabel when selectAllActive=true and allSelectedLabel is provided', () => {
    renderSelect({
      selectAllActive: true,
      allSelectedLabel: 'All fruits selected',
      selectedIds: [],
    })
    expect(
      screen.getByRole('button', { name: /All fruits selected/ }),
    ).toBeInTheDocument()
  })

  it('falls back to selectedLabel(items.length) when selectAllActive=true but no allSelectedLabel', () => {
    renderSelect({ selectAllActive: true, selectedIds: [] })
    // items.length = 3
    expect(
      screen.getByRole('button', { name: /3 fruit selected/ }),
    ).toBeInTheDocument()
  })
})

// #################################################################################################

describe('MultiSelect — open / close', () => {
  it('clicking trigger opens dropdown (search input, items, footer visible)', async () => {
    const user = userEvent.setup()
    renderSelect()

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))

    expect(screen.getByRole('textbox', { name: /Search/ })).toBeInTheDocument()
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Apply/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument()
  })

  it('pressing Escape closes the dropdown', async () => {
    const user = userEvent.setup()
    renderSelect()

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))
    expect(screen.getByText('Apple')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByText('Apple')).not.toBeInTheDocument()
  })

  it('clicking Cancel button closes the dropdown', async () => {
    const user = userEvent.setup()
    renderSelect()

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))
    await user.click(screen.getByRole('button', { name: /Cancel/ }))

    expect(screen.queryByText('Apple')).not.toBeInTheDocument()
  })

  it('clicking Apply closes the dropdown and calls onApply with draft + meta', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    renderSelect({ onApply })

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))
    await user.click(screen.getByRole('button', { name: /Apply/ }))

    expect(onApply).toHaveBeenCalledWith([], { selectAll: false })
    expect(screen.queryByText('Apple')).not.toBeInTheDocument()
  })

  it('clicking outside closes the dropdown and calls onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    renderSelect({ onCancel })

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))
    expect(screen.getByText('Apple')).toBeInTheDocument()

    // Click outside the dropdown
    await user.click(document.body)

    expect(screen.queryByText('Apple')).not.toBeInTheDocument()
    expect(onCancel).toHaveBeenCalledOnce()
  })
})

// #################################################################################################

describe('MultiSelect — search', () => {
  it('typing in search input calls onSearchChange with the new value', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    renderSelect({ onSearchChange })

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))
    await user.type(screen.getByRole('textbox', { name: /Search/ }), 'p')

    // The input is controlled — each keypress fires onChange with the new char appended to value prop.
    // Since searchValue prop is "" (not updated in this test), each call receives only the new char.
    expect(onSearchChange).toHaveBeenCalledWith('p')
  })

  it('search input value reflects the searchValue prop (controlled)', async () => {
    const user = userEvent.setup()
    renderSelect({ searchValue: 'banana' })

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))

    expect(screen.getByRole('textbox', { name: /Search/ })).toHaveValue(
      'banana',
    )
  })
})

// #################################################################################################

describe('MultiSelect — individual item selection', () => {
  it('clicking an item toggles it in the draft (visual checked state changes)', async () => {
    const user = userEvent.setup()
    renderSelect()

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))

    const appleCheckbox = screen.getByRole('checkbox', { name: /Apple/ })
    expect(appleCheckbox).not.toBeChecked()

    await user.click(appleCheckbox)
    expect(appleCheckbox).toBeChecked()
  })

  it('clicking Apply emits onApply with selected IDs and selectAll: false', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    renderSelect({ onApply })

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))
    await user.click(screen.getByRole('checkbox', { name: /Apple/ }))
    await user.click(screen.getByRole('checkbox', { name: /Cherry/ }))
    await user.click(screen.getByRole('button', { name: /Apply/ }))

    expect(onApply).toHaveBeenCalledWith(['a', 'c'], { selectAll: false })
  })

  it('Cancel reverts the draft — re-opening shows committed selection, not discarded draft', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    renderSelect({ selectedIds: ['b'], onApply })

    // Open and toggle something without applying
    await user.click(screen.getByRole('button', { name: /1 fruit selected/ }))
    await user.click(screen.getByRole('checkbox', { name: /Apple/ })) // now Apple is drafted-on
    await user.click(screen.getByRole('button', { name: /Cancel/ }))

    // Re-open — should only show committed selection (Banana, not Apple)
    await user.click(screen.getByRole('button', { name: /1 fruit selected/ }))

    expect(screen.getByRole('checkbox', { name: /Apple/ })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Banana/ })).toBeChecked()
  })
})

// #################################################################################################

describe('MultiSelect — select-all behavior', () => {
  it('clicking select-all checkbox sets draftSelectAll on and all items appear checked', async () => {
    const user = userEvent.setup()
    renderSelect()

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))
    await user.click(screen.getByRole('checkbox', { name: /Select all/ }))

    const appleCheckbox = screen.getByRole('checkbox', { name: /Apple/ })
    const bananaCheckbox = screen.getByRole('checkbox', { name: /Banana/ })
    expect(appleCheckbox).toBeChecked()
    expect(bananaCheckbox).toBeChecked()
  })

  it('Apply with selectAll on emits onApply([], { selectAll: true })', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    renderSelect({ onApply })

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))
    await user.click(screen.getByRole('checkbox', { name: /Select all/ }))
    await user.click(screen.getByRole('button', { name: /Apply/ }))

    expect(onApply).toHaveBeenCalledWith([], { selectAll: true })
  })

  it('with selectAllActive=true and dropdown open, all items show checked', async () => {
    const user = userEvent.setup()
    renderSelect({
      selectAllActive: true,
      allSelectedLabel: 'All fruits selected',
    })

    await user.click(
      screen.getByRole('button', { name: /All fruits selected/ }),
    )

    expect(screen.getByRole('checkbox', { name: /Apple/ })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Banana/ })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Cherry/ })).toBeChecked()
  })

  it('clicking an item while in select-all mode switches to individual mode with all-minus-clicked', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    renderSelect({ onApply })

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))
    // Activate select-all first
    await user.click(screen.getByRole('checkbox', { name: /Select all/ }))

    // Now deselect Banana
    await user.click(screen.getByRole('checkbox', { name: /Banana/ }))

    // Select all checkbox should now be off
    expect(
      screen.getByRole('checkbox', { name: /Select all/ }),
    ).not.toBeChecked()

    // Apply should emit all IDs except 'b'
    await user.click(screen.getByRole('button', { name: /Apply/ }))
    expect(onApply).toHaveBeenCalledWith(expect.not.arrayContaining(['b']), {
      selectAll: false,
    })
    const callArgs = onApply.mock.calls[0][0] as string[]
    expect(callArgs).toContain('a')
    expect(callArgs).toContain('c')
    expect(callArgs).not.toContain('b')
  })

  it('indeterminate: when some (not all) items are individually selected, select-all is indeterminate', async () => {
    const user = userEvent.setup()
    renderSelect({ selectedIds: ['a'] })

    await user.click(screen.getByRole('button', { name: /1 fruit selected/ }))

    const selectAllCheckbox = screen.getByRole('checkbox', {
      name: /Select all/,
    })
    expect((selectAllCheckbox as HTMLInputElement).indeterminate).toBe(true)
  })
})

// #################################################################################################

describe('MultiSelect — empty / loading / error states', () => {
  it("loading=true and items=[] shows 'Loading...'", async () => {
    const user = userEvent.setup()
    renderSelect({ items: [], loading: true })

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it("loading=false, items=[], no searchValue shows 'No items available'", async () => {
    const user = userEvent.setup()
    renderSelect({ items: [], loading: false, searchValue: '' })

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))

    expect(screen.getByText('No items available')).toBeInTheDocument()
  })

  it("loading=false, items=[], searchValue set shows 'No results for ...'", async () => {
    const user = userEvent.setup()
    renderSelect({ items: [], loading: false, searchValue: 'foo' })

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))

    // The component renders &ldquo; / &rdquo; (curly quotes) around the search term
    const noResultsEl = screen.getByText(/No results for/)
    expect(noResultsEl).toBeInTheDocument()
    expect(noResultsEl.textContent).toContain('foo')
  })

  it('error prop shows error text', async () => {
    const user = userEvent.setup()
    renderSelect({ error: 'Something went wrong' })

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))

    const errorEl = screen.getByText('Something went wrong')
    expect(errorEl).toBeInTheDocument()
    expect(errorEl).toHaveClass('text-red-500')
  })
})

// #################################################################################################

describe('MultiSelect — infinite scroll', () => {
  it('calls onLoadMore when scroll position is within 60px of bottom and hasMore=true', async () => {
    const user = userEvent.setup()
    const onLoadMore = vi.fn()
    renderSelect({ hasMore: true, loadingMore: false, onLoadMore })

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))

    // Find the scrollable list container (the div with onScroll)
    // It's the sibling div wrapping item labels, identified by its class
    const listContainer = document.querySelector(
      '.max-h-80.overflow-y-auto',
    ) as HTMLDivElement

    expect(listContainer).not.toBeNull()

    // Simulate scroll near bottom: scrollHeight - scrollTop - clientHeight < 60
    Object.defineProperty(listContainer, 'scrollHeight', {
      value: 500,
      configurable: true,
    })
    Object.defineProperty(listContainer, 'clientHeight', {
      value: 400,
      configurable: true,
    })
    Object.defineProperty(listContainer, 'scrollTop', {
      value: 450,
      configurable: true,
    })

    // Fire a native scroll event
    listContainer.dispatchEvent(new Event('scroll'))

    expect(onLoadMore).toHaveBeenCalledOnce()
  })

  it("loadingMore=true shows 'Loading more...' indicator", async () => {
    const user = userEvent.setup()
    renderSelect({ loadingMore: true })

    await user.click(screen.getByRole('button', { name: /Select fruit/ }))

    expect(screen.getByText('Loading more...')).toBeInTheDocument()
  })
})
