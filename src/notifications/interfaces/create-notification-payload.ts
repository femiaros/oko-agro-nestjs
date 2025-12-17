import { User } from '../../users/entities/user.entity';
import { NotificationType, RelatedEntityType } from '../entities/notification.entity';

export interface CreateNotificationPayload {
    user: User;
    type: NotificationType;
    title: string;
    message: string;
    relatedEntityType: RelatedEntityType;
    relatedEntityId: string;
    senderId?: string;
    senderName?: string;
}
