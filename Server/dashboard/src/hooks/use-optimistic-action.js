"use client"

import * as React from "react"

/**
 * Optimistic UI Hook - Vibecode Architect Rule 7
 * 
 * Animates the success state INSTANTLY before server confirms.
 * Creates the illusion of zero latency for better UX.
 * 
 * @example
 * const { execute, isLoading, isSuccess, animationClass } = useOptimisticAction({
 *   action: async (data) => await api.delete(data.id),
 *   onSuccess: () => toast.success("Deleted!"),
 *   animationType: "delete", // "success" | "delete" | "like" | "check" | "add"
 * });
 * 
 * <button 
 *   className={animationClass} 
 *   onClick={() => execute({ id: 1 })}
 * >
 *   Delete
 * </button>
 */
export function useOptimisticAction({
  action,
  onSuccess,
  onError,
  animationType = "success",
  optimisticDelay = 200,
}) {
  const [state, setState] = React.useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    animating: false,
  })

  // Animation class mapping based on type
  const animationClasses = {
    success: "optimistic-success",
    delete: "optimistic-delete",
    like: "optimistic-like",
    check: "optimistic-check",
    add: "optimistic-add",
  }

  const execute = React.useCallback(
    async (data) => {
      // Start animation immediately (optimistic)
      setState({
        isLoading: true,
        isSuccess: true, // Optimistic success
        isError: false,
        error: null,
        animating: true,
      })

      try {
        // Execute the actual action
        const result = await action(data)
        
        // Brief delay to let animation complete
        await new Promise((resolve) => setTimeout(resolve, optimisticDelay))
        
        setState({
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
          animating: false,
        })

        onSuccess?.(result)
        return result
      } catch (error) {
        // Revert on error
        setState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error,
          animating: false,
        })

        onError?.(error)
        throw error
      }
    },
    [action, onSuccess, onError, optimisticDelay]
  )

  const reset = React.useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      animating: false,
    })
  }, [])

  const animationClass = state.animating
    ? animationClasses[animationType]
    : ""

  return {
    execute,
    reset,
    isLoading: state.isLoading,
    isSuccess: state.isSuccess,
    isError: state.isError,
    error: state.error,
    animating: state.animating,
    animationClass,
  }
}

/**
 * Optimistic List Hook - Vibecode Architect Rule 7
 * 
 * Manages optimistic updates for list operations (add, remove, update).
 * Changes are reflected immediately, with automatic rollback on error.
 * 
 * @example
 * const { items, addItem, removeItem, updateItem } = useOptimisticList({
 *   initialItems: users,
 *   addAction: async (item) => await api.create(item),
 *   removeAction: async (id) => await api.delete(id),
 * });
 */
export function useOptimisticList({
  initialItems = [],
  addAction,
  removeAction,
  updateAction,
  onAddSuccess,
  onRemoveSuccess,
  onUpdateSuccess,
  onError,
}) {
  const [items, setItems] = React.useState(initialItems)
  const [pendingIds, setPendingIds] = React.useState(new Set())
  const [removingIds, setRemovingIds] = React.useState(new Set())

  // Sync with external initial items
  React.useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const addItem = React.useCallback(
    async (newItem) => {
      // Generate temporary ID for optimistic item
      const tempId = `temp_${Date.now()}`
      const optimisticItem = { ...newItem, id: tempId, _optimistic: true }

      // Add immediately (optimistic)
      setItems((prev) => [...prev, optimisticItem])
      setPendingIds((prev) => new Set(prev).add(tempId))

      try {
        const result = await addAction?.(newItem)
        
        // Replace temp item with real item
        setItems((prev) =>
          prev.map((item) =>
            item.id === tempId ? { ...result, _optimistic: false } : item
          )
        )

        onAddSuccess?.(result)
        return result
      } catch (error) {
        // Remove optimistic item on error
        setItems((prev) => prev.filter((item) => item.id !== tempId))
        onError?.(error)
        throw error
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev)
          next.delete(tempId)
          return next
        })
      }
    },
    [addAction, onAddSuccess, onError]
  )

  const removeItem = React.useCallback(
    async (id) => {
      // Mark as removing (for animation)
      setRemovingIds((prev) => new Set(prev).add(id))

      // Store for rollback
      const itemToRemove = items.find((item) => item.id === id)

      // Wait for animation to complete
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Remove immediately (optimistic)
      setItems((prev) => prev.filter((item) => item.id !== id))
      setRemovingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })

      try {
        await removeAction?.(id)
        onRemoveSuccess?.(id)
      } catch (error) {
        // Rollback on error
        if (itemToRemove) {
          setItems((prev) => [...prev, itemToRemove])
        }
        onError?.(error)
        throw error
      }
    },
    [items, removeAction, onRemoveSuccess, onError]
  )

  const updateItem = React.useCallback(
    async (id, updates) => {
      // Store original for rollback
      const originalItem = items.find((item) => item.id === id)

      // Update immediately (optimistic)
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updates, _optimistic: true } : item
        )
      )
      setPendingIds((prev) => new Set(prev).add(id))

      try {
        const result = await updateAction?.(id, updates)
        
        // Apply server result
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...result, _optimistic: false } : item
          )
        )

        onUpdateSuccess?.(result)
        return result
      } catch (error) {
        // Rollback on error
        if (originalItem) {
          setItems((prev) =>
            prev.map((item) => (item.id === id ? originalItem : item))
          )
        }
        onError?.(error)
        throw error
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    },
    [items, updateAction, onUpdateSuccess, onError]
  )

  // Helper to check if item is pending
  const isPending = React.useCallback(
    (id) => pendingIds.has(id),
    [pendingIds]
  )

  // Helper to check if item is being removed
  const isRemoving = React.useCallback(
    (id) => removingIds.has(id),
    [removingIds]
  )

  // Get animation class for an item
  const getItemClass = React.useCallback(
    (id) => {
      if (removingIds.has(id)) return "optimistic-delete"
      if (pendingIds.has(id)) return "optimistic-success"
      return ""
    },
    [pendingIds, removingIds]
  )

  return {
    items,
    setItems,
    addItem,
    removeItem,
    updateItem,
    isPending,
    isRemoving,
    getItemClass,
    pendingIds,
    removingIds,
  }
}
