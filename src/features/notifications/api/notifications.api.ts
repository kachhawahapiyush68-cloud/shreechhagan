import { postApiPath } from "@/lib/http";
import type { NotificationDto, NotificationReadResultDto } from "@/types/api";
import { ENV } from "../../../../config/env";

const CLIENT_CODE = ENV.CLIENT_CODE;

// Normalizes IsRead — API returns false (boolean) or 0 (number) for unread
export function isNotificationRead(n: NotificationDto): boolean {
  return n.IsRead === true || n.IsRead === 1;
}

export async function getNotifications(
  customerId: number,
): Promise<NotificationDto[]> {
  try {
    const res = await postApiPath<NotificationDto[]>(
      "/api/customer/notifications",
      { Payload: { ClientCode: CLIENT_CODE, CustomerId: customerId } },
      { requireAuth: false },
    );
    if (res.Status !== 200 || !Array.isArray(res.Data)) return [];
    return res.Data;
  } catch {
    return [];
  }
}

// Union extracted to a named type so the generic stays on one line
// (inline multiline generics break TypeScript/Babel's parser)
type MarkReadResponse = NotificationReadResultDto[] | NotificationReadResultDto;

export async function markNotificationRead(params: {
  notificationId: number;
  customerId: number;
}): Promise<boolean> {
  try {
    const res = await postApiPath<MarkReadResponse>(
      "/api/customer/notifications/read",
      {
        Payload: {
          ClientCode: CLIENT_CODE,
          NotificationId: params.notificationId,
          CustomerId: params.customerId,
        },
      },
      { requireAuth: false },
    );
    if (res.Status !== 200 || !res.Data) return false;
    // Data may be [{Success:1}] or {Success:1}
    const node = Array.isArray(res.Data) ? res.Data[0] : res.Data;
    return node?.Success === 1;
  } catch {
    return false;
  }
}
