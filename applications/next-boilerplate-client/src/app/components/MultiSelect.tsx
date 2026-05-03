'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// #################################################################################################

export interface MultiSelectProps<T> {
  items: T[]
  hasMore?: boolean
  loading?: boolean
  className?: string
  disabled?: boolean
  placeholder: string
  searchValue: string
  loadingMore?: boolean
  selectedIds: string[]
  error?: string | null
  onCancel?: () => void
  onLoadMore?: () => void
  getId: (item: T) => string
  getLabel: (item: T) => string
  onSearchChange: (value: string) => void
  selectedLabel: (count: number) => string
  onApply: (selectedIds: string[]) => void
}

// #################################################################################################

export function MultiSelect<T>(props: MultiSelectProps<T>) {
  const {
    placeholder,
    selectedLabel,
    items,
    selectedIds,
    getId,
    getLabel,
    searchValue,
    onSearchChange,
    hasMore = false,
    loadingMore = false,
    onLoadMore,
    loading = false,
    error = null,
    onApply,
    onCancel,
    className = '',
    disabled = false,
  } = props

  const [isOpen, setIsOpen] = useState(false)
  const [draftSelectedIds, setDraftSelectedIds] = useState<string[]>([])

  const listRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectAllRef = useRef<HTMLInputElement>(null)

  // On open, copy committed selections into draft state
  useEffect(() => {
    if (isOpen) {
      setDraftSelectedIds(selectedIds)
    }
  }, [isOpen, selectedIds])

  // Click outside reverts draft to match Figma cancel behavior
  useEffect(() => {
    if (!isOpen) return

    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
        onCancel?.()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)

    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen, onCancel])

  // Escape key closes and cancels
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        onCancel?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  // Sync select-all checkbox indeterminate state
  useEffect(() => {
    if (!selectAllRef.current || items.length === 0) return

    const allSelected = items.every((item) =>
      draftSelectedIds.includes(getId(item)),
    )
    const someSelected = items.some((item) =>
      draftSelectedIds.includes(getId(item)),
    )

    selectAllRef.current.indeterminate = !allSelected && someSelected
  }, [draftSelectedIds, items, getId])

  const handleToggleItem = useCallback((id: string) => {
    setDraftSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }, [])

  const handleApply = useCallback(() => {
    onApply(draftSelectedIds)
    setIsOpen(false)
  }, [onApply, draftSelectedIds])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    onCancel?.()
  }, [onCancel])

  // Infinite scroll: trigger loadMore when near bottom of the items list
  const handleScroll = useCallback(() => {
    if (!listRef.current || !hasMore || loadingMore) return

    const { scrollTop, scrollHeight, clientHeight } = listRef.current

    if (scrollHeight - scrollTop - clientHeight < 60) {
      onLoadMore?.()
    }
  }, [hasMore, loadingMore, onLoadMore])

  // Select-all operates on currently loaded items only — paginated items not yet fetched are unaffected.
  const handleSelectAll = useCallback(() => {
    const visibleIds = items.map(getId)
    const allSelected = visibleIds.every((id) => draftSelectedIds.includes(id))

    if (allSelected) {
      setDraftSelectedIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id)),
      )
    } else {
      setDraftSelectedIds((prev) => {
        const toAdd = visibleIds.filter((id) => !prev.includes(id))

        return [...prev, ...toAdd]
      })
    }
  }, [items, getId, draftSelectedIds])

  const allSelected =
    items.length > 0 &&
    items.every((item) => draftSelectedIds.includes(getId(item)))

  const triggerLabel =
    selectedIds.length === 0 ? placeholder : selectedLabel(selectedIds.length)

  const triggerLabelClass =
    selectedIds.length === 0 ? 'text-gray-500' : 'text-gray-900'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={triggerLabelClass}>{triggerLabel}</span>
        {/* Chevron-down icon — rotates when open */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="p-3">
            {/* Search input */}
            <div className="relative mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                aria-label="Search"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Select all row — hidden when no items */}
            {items.length > 0 && (
              <label className="flex cursor-pointer items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="accent-teal-500 h-4 w-4 rounded"
                />
                Select all
              </label>
            )}

            {/* Item list with scroll */}
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="max-h-80 overflow-y-auto"
            >
              {/* Loading state */}
              {loading && items.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-500">
                  Loading...
                </p>
              )}

              {/* Empty — no items in dataset */}
              {!loading && items.length === 0 && !searchValue && (
                <p className="py-4 text-center text-sm text-gray-500">
                  No items available
                </p>
              )}

              {/* Empty — search returned no results */}
              {!loading && items.length === 0 && searchValue && (
                <p className="py-4 text-center text-sm text-gray-500">
                  No results for &ldquo;{searchValue}&rdquo;
                </p>
              )}

              {/* Error state */}
              {error && (
                <p className="py-4 text-center text-sm text-red-500">{error}</p>
              )}

              {/* Item rows */}
              {items.map((item) => {
                const id = getId(item)
                const label = getLabel(item)
                const checked = draftSelectedIds.includes(id)

                return (
                  <label
                    key={id}
                    className="flex cursor-pointer items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleItem(id)}
                      className="accent-teal-500 h-4 w-4 rounded"
                    />
                    {label}
                  </label>
                )
              })}

              {/* Load more spinner at bottom of list */}
              {loadingMore && (
                <p className="py-2 text-center text-sm text-gray-500">
                  Loading more...
                </p>
              )}
            </div>

            {/* Footer: Cancel / Apply */}
            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={loading}
                className="rounded-md bg-teal-500 px-4 py-2 text-sm text-white hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
