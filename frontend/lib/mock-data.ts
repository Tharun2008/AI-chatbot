import type {
  Conversation,
  DashboardMetric,
  KnowledgeFile,
  SettingsForm,
} from "@/types/dashboard";

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Messages Today",
    value: "1,284",
    detail: "18 percent higher than yesterday",
    tone: "blue",
  },
  {
    label: "Active Conversations",
    value: "37",
    detail: "12 need a human follow-up",
    tone: "emerald",
  },
  {
    label: "Documents Uploaded",
    value: "0",
    detail: "Upload FAQs and policies to train replies",
    tone: "amber",
  },
  {
    label: "AI Status",
    value: "Online",
    detail: "Answering customer questions normally",
    tone: "violet",
  },
];

export const knowledgeFiles: KnowledgeFile[] = [];

export const conversations: Conversation[] = [
  {
    id: "conv_001",
    customerName: "Aarav Sharma",
    phoneNumber: "+91 98765 43210",
    status: "Open",
    lastMessage: "Can you share pricing for the starter plan?",
    updatedAt: "2 min ago",
    messages: [
      {
        id: "msg_001",
        sender: "customer",
        text: "Hi, can you share pricing for the starter plan?",
        sentAt: "10:24 AM",
      },
      {
        id: "msg_002",
        sender: "assistant",
        text: "Sure. The starter plan is designed for small teams and includes automated WhatsApp replies, knowledge base answers, and conversation tracking.",
        sentAt: "10:25 AM",
      },
    ],
  },
  {
    id: "conv_002",
    customerName: "Neha Verma",
    phoneNumber: "+91 91234 56780",
    status: "Waiting",
    lastMessage: "I uploaded the invoice. Please check.",
    updatedAt: "18 min ago",
    messages: [],
  },
  {
    id: "conv_003",
    customerName: "Rahul Mehta",
    phoneNumber: "+91 99887 76655",
    status: "Resolved",
    lastMessage: "Thanks, that solved it.",
    updatedAt: "1 hr ago",
    messages: [],
  },
];

export const settings: SettingsForm = {
  businessName: "AI Chatbot for WhatsApp",
  whatsappNumber: "+91 90000 00000",
  openAiApiKey: "",
};
