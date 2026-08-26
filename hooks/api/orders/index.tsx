import { useFetch } from "@/context/FetchContext";
import { useStore } from "@/context/StoreContext";
import { OrderDraft } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  OPEN_ORDERS_KEY,
  ORDER_KEY,
  ORDERS_KEY,
  SCHEDULED_ORDERS_KEY,
} from "./constants";
import {
  createOrder,
  CreateOrderResponse,
  OrderUpdatePatch,
  updateOrder,
} from "./mutations";
import {
  openOrderIdsQuery,
  orderQuery,
  ordersQuery,
  scheduledOrderIdsQuery,
} from "./queries";
import { useRealtimeInvalidate } from "./useRealtimeInvalidate";

export function useCreateOrder(
  config: { retry?: number; retryDelay?: number } = {}
) {
  const { client } = useFetch();
  const { activeStore } = useStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OrderDraft) =>
      createOrder({ client, payload, storeId: activeStore!.id }),
    onSuccess: (data: CreateOrderResponse) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [OPEN_ORDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [SCHEDULED_ORDERS_KEY] });
      if (data?.order_id) {
        queryClient.invalidateQueries({ queryKey: [ORDER_KEY, data.order_id] });
      }
    },
    ...config,
  });
}

export function useOrderQuery({
  orderId,
  enabled = true,
}: {
  orderId: string;
  enabled?: boolean;
}) {
  const { client } = useFetch();
  const isEnabled = !!orderId && enabled;

  /*   useRealtimeInvalidate({
    table: 'order',
    filter: orderId ? `id=eq.${orderId}` : undefined,
    queryKey: [ORDER_KEY, orderId],
    enabled: isEnabled
  })

  useRealtimeInvalidate({
    table: 'order_item',
    filter: orderId ? `order_id=eq.${orderId}` : undefined,
    queryKey: [ORDER_KEY, orderId],
    enabled: isEnabled
  }) */

  return useQuery({
    queryKey: [ORDER_KEY, orderId],
    enabled: isEnabled,
    queryFn: () => orderQuery({ client, orderId }),
  });
}

export function useOpenOrderIdsQuery() {
  const { client } = useFetch();
  const { activeStore } = useStore();

  useRealtimeInvalidate({
    table: "order",
    filter: activeStore?.id ? `store_id=eq.${activeStore.id}` : undefined,
    queryKey: [OPEN_ORDERS_KEY, activeStore?.id],
    enabled: !!activeStore?.id,
  });

  return useQuery({
    queryKey: [OPEN_ORDERS_KEY, activeStore?.id],
    queryFn: () => openOrderIdsQuery({ client, storeId: activeStore!.id }),
  });
}

export function useScheduledOrderIdsQuery() {
  const { client } = useFetch();
  const { activeStore } = useStore();

  useRealtimeInvalidate({
    table: "order",
    filter: activeStore?.id ? `store_id=eq.${activeStore.id}` : undefined,
    queryKey: [SCHEDULED_ORDERS_KEY, activeStore?.id],
    enabled: !!activeStore?.id,
  });

  return useQuery({
    queryKey: [SCHEDULED_ORDERS_KEY, activeStore?.id],
    queryFn: () => scheduledOrderIdsQuery({ client, storeId: activeStore!.id }),
  });
}

export function useOrdersQuery({
  page,
  pageSize = 5,
  search,
  status,
  payment_status,
}: {
  page: number;
  pageSize?: number;
  search?: string;
  status?: "OPEN" | "CLOSED";
  payment_status?: "PAID" | "UNPAID";
}) {
  const { client } = useFetch();
  const { activeStore } = useStore();

  return useQuery({
    queryKey: [
      ORDERS_KEY,
      page,
      pageSize,
      search,
      status,
      payment_status,
      activeStore?.id,
    ],
    queryFn: () =>
      ordersQuery({
        client,
        storeId: activeStore!.id,
        page,
        pageSize,
        search,
        status,
        payment_status,
      }),
    placeholderData: (prev) => prev,
  });
}

export function useUpdateOrder() {
  const { client } = useFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      patch,
    }: {
      orderId: string;
      patch: OrderUpdatePatch;
    }) => updateOrder({ client, orderId, patch }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ORDER_KEY, variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: [OPEN_ORDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [SCHEDULED_ORDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
  });
}
