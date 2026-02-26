export interface SmsProvider {
    sendSms(to: string, message: string): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}