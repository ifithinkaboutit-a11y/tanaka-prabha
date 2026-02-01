// src/data/content/notifications.ts
import { Ionicons } from "@expo/vector-icons";

export interface Notification {
  id: string;
  type: "approval" | "reminder" | "alert";
  title: string;
  titleKey: string;
  description: string;
  descriptionKey: string;
  time: string;
  date: Date;
  isRead: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  iconBgColor: string;
}

// Static notifications data
export const notifications: Notification[] = [
  // Today
  {
    id: "1",
    type: "approval",
    title: "Kisan Credit Card Approved",
    titleKey: "notifications.kisanCardApproved",
    description: "Your Kisan Credit Card has been approved...",
    descriptionKey: "notifications.kisanCardApprovedDesc",
    time: "8:45 pm",
    date: new Date(2026, 1, 1, 20, 45),
    isRead: false,
    icon: "card-outline",
    iconBgColor: "#E3F2FD",
  },
  {
    id: "2",
    type: "reminder",
    title: "Loan Repayment Reminder",
    titleKey: "notifications.loanReminder",
    description: "Your KCC loan repayment is due in 15 da...",
    descriptionKey: "notifications.loanReminderDesc",
    time: "6:28 pm",
    date: new Date(2026, 1, 1, 18, 28),
    isRead: false,
    icon: "time-outline",
    iconBgColor: "#FCE4EC",
  },
  {
    id: "3",
    type: "alert",
    title: "Weather Alert",
    titleKey: "notifications.weatherAlert",
    description: "Heavy rainfall expected. Crop insurance...",
    descriptionKey: "notifications.weatherAlertDesc",
    time: "5:12 pm",
    date: new Date(2026, 1, 1, 17, 12),
    isRead: false,
    icon: "rainy-outline",
    iconBgColor: "#FFF3E0",
  },
  // Yesterday
  {
    id: "4",
    type: "approval",
    title: "Kisan Credit Card Approved",
    titleKey: "notifications.kisanCardApproved",
    description: "Your Kisan Credit Card has been approved...",
    descriptionKey: "notifications.kisanCardApprovedDesc",
    time: "8:45 pm",
    date: new Date(2026, 0, 31, 20, 45),
    isRead: true,
    icon: "card-outline",
    iconBgColor: "#E3F2FD",
  },
  {
    id: "5",
    type: "reminder",
    title: "Loan Repayment Reminder",
    titleKey: "notifications.loanReminder",
    description: "Your KCC loan repayment is due in 15 da...",
    descriptionKey: "notifications.loanReminderDesc",
    time: "6:28 pm",
    date: new Date(2026, 0, 31, 18, 28),
    isRead: true,
    icon: "time-outline",
    iconBgColor: "#FCE4EC",
  },
  {
    id: "6",
    type: "alert",
    title: "Weather Alert",
    titleKey: "notifications.weatherAlert",
    description: "Heavy rainfall expected. Crop insurance...",
    descriptionKey: "notifications.weatherAlertDesc",
    time: "5:12 pm",
    date: new Date(2026, 0, 31, 17, 12),
    isRead: true,
    icon: "rainy-outline",
    iconBgColor: "#FFF3E0",
  },
  // Others (older)
  {
    id: "7",
    type: "reminder",
    title: "Loan Repayment Reminder",
    titleKey: "notifications.loanReminder",
    description: "Your KCC loan repayment is due in 15 da...",
    descriptionKey: "notifications.loanReminderDesc",
    time: "6:28 pm",
    date: new Date(2026, 0, 25, 18, 28),
    isRead: true,
    icon: "time-outline",
    iconBgColor: "#FCE4EC",
  },
  {
    id: "8",
    type: "approval",
    title: "Kisan Credit Card Approved",
    titleKey: "notifications.kisanCardApproved",
    description: "Your Kisan Credit Card has been approved...",
    descriptionKey: "notifications.kisanCardApprovedDesc",
    time: "8:48 pm",
    date: new Date(2026, 0, 20, 20, 48),
    isRead: true,
    icon: "card-outline",
    iconBgColor: "#E3F2FD",
  },
];

// Helper to group notifications by date
export const groupNotificationsByDate = (notifs: Notification[]) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { title: string; titleKey: string; data: Notification[] }[] = [
    { title: "Today", titleKey: "notifications.today", data: [] },
    { title: "Yesterday", titleKey: "notifications.yesterday", data: [] },
    { title: "Others", titleKey: "notifications.others", data: [] },
  ];

  notifs.forEach((notif) => {
    const notifDate = new Date(notif.date);
    if (notifDate.toDateString() === today.toDateString()) {
      groups[0].data.push(notif);
    } else if (notifDate.toDateString() === yesterday.toDateString()) {
      groups[1].data.push(notif);
    } else {
      groups[2].data.push(notif);
    }
  });

  return groups.filter((g) => g.data.length > 0);
};
