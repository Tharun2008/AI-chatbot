export type NavItem = {
  label: string;
  href: string;
  icon: "dashboard" | "knowledge" | "conversations" | "settings";
};

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "emerald" | "amber" | "violet";
};

export type KnowledgeFile = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: "Processing" | "Ready" | "Failed";
};

export type ChatMessage = {
  id: string;
  sender: "customer" | "assistant";
  text: string;
  sentAt: string;
};

export type Conversation = {
  id: string;
  customerName: string;
  phoneNumber: string;
  status: "Open" | "Resolved" | "Waiting";
  lastMessage: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export type SettingsForm = {
  businessName: string;
  whatsappNumber: string;
  openAiApiKey: string;
};
