// src/data/content/quickActions.ts
import { QuickAction } from "../interfaces";

export const quickActions: QuickAction[] = [
  {
    title: "home.updateProfile",
    icon: "person-outline",
    imageUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=profile&backgroundColor=b6e3f4",
  },
  {
    title: "home.ongoingEvents",
    icon: "calendar-outline",
    imageUrl:
      "https://api.dicebear.com/7.x/shapes/svg?seed=calendar&backgroundColor=c0aede",
  },
  {
    title: "home.governmentSchemes",
    icon: "document-text-outline",
    imageUrl:
      "https://api.dicebear.com/7.x/identicon/svg?seed=building&backgroundColor=ffd5dc",
  },
  {
    title: "home.bookAppointment",
    icon: "call-outline",
    imageUrl:
      "https://api.dicebear.com/7.x/bottts/svg?seed=professional&backgroundColor=d1d4f9",
  },
];
