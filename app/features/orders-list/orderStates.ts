const orderStates: Record<
  string,
  { expanded: boolean; paidItems: Record<string, boolean> }
> = {}

export function getOrderState(orderId: string) {
  if (!orderStates[orderId]) {
    orderStates[orderId] = { expanded: false, paidItems: {} }
  }
  return orderStates[orderId]
}

export function setOrderExpanded(orderId: string, expanded: boolean) {
  if (orderStates[orderId]) {
    orderStates[orderId].expanded = expanded
  }
}

export function setOrderPaidItem(
  orderId: string,
  key: string,
  value: boolean
) {
  if (orderStates[orderId]) {
    orderStates[orderId].paidItems[key] = value
  }
}

export function clearOrderState(orderId: string) {
  delete orderStates[orderId]
}
