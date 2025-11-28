
import { Transaction, Budget, Subscription, Goal, NotificationSetting, User, RiskAnalysis } from "../types";
export const NotificationsService = {
    sendEmail: async (to: string, subject: string, html: string) => {},
    checkAll: async (s: NotificationSetting[], t: Transaction[], b: Budget[], sub: Subscription[], g: Goal[], r: RiskAnalysis, u: User | null) => [],
    getDefaultSettings: (): NotificationSetting[] => []
};
