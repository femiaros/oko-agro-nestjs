import { User } from '../../users/entities/user.entity';
import { NotificationAudience, NotificationType, RelatedEntityType } from '../entities/notification.entity';

export interface CreateNotificationPayload {
    user?: User | null;
    audience?: NotificationAudience;
    type: NotificationType;
    title: string;
    message: string;
    relatedEntityType?: RelatedEntityType | null;
    relatedEntityId?: string | null;
    senderId?: string | null;
    senderName?: string | null;
}
