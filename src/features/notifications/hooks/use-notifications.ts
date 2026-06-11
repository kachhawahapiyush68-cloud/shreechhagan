import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  getNotifications,
  isNotificationRead,
  markNotificationRead,
} from "@/features/notifications/api/notifications.api";
import type { NotificationDto } from "@/types/api";

export const notificationQueryKeys = {
  list: (customerId: number) => ["notifications", "list", customerId] as const,
};

export function useNotificationsQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useQuery({
    queryKey: notificationQueryKeys.list(customerId),
    queryFn: () => getNotifications(customerId),
    enabled: customerId > 0,
    staleTime: 1000 * 60,
  });
}

export function useUnreadNotificationCount() {
  const { data } = useNotificationsQuery();
  return (data ?? []).filter((n) => !isNotificationRead(n)).length;
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useMutation({
    mutationFn: (notificationId: number) =>
      markNotificationRead({ notificationId, customerId }),
    // Optimistic: flip IsRead locally so the row dims instantly
    onMutate: async (notificationId) => {
      if (!customerId) return;
      const key = notificationQueryKeys.list(customerId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationDto[]>(key);

      queryClient.setQueryData<NotificationDto[]>(key, (current = []) =>
        current.map((n) =>
          n.NotificationId === notificationId ? { ...n, IsRead: true } : n,
        ),
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (!customerId || !context) return;
      queryClient.setQueryData(
        notificationQueryKeys.list(customerId),
        context.previous,
      );
    },
    onSettled: () => {
      if (customerId) {
        void queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.list(customerId),
        });
      }
    },
  });
}
