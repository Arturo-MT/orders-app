const categoryStates: Record<string, boolean> = {}

export function getCategoryState(categoryId: string) {
  return categoryStates[categoryId] ?? false
}

export function setCategoryState(categoryId: string, isOpen: boolean) {
  categoryStates[categoryId] = isOpen
}

export function toggleCategoryState(categoryId: string) {
  categoryStates[categoryId] = !categoryStates[categoryId]
}

export function resetCategoryStates(categoryIds: string[]) {
  categoryIds.forEach((id) => {
    categoryStates[id] = false
  })
}
