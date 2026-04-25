import type { Timestamp } from "firebase/firestore";
import type { NotificationType } from "@/views/notification/types/interface";

interface FirestoreNotification {
  userUid: string;
  coupleId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  refId: string | null;
  createdAt?: Timestamp | null;
}

export type { FirestoreNotification };
