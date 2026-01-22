
export type Tone = 'professional' | 'polite' | 'casual' | 'urgent' | 'short' | 'creative';
export type Priority = 'high' | 'medium' | 'low';
export type Category = 'Work' | 'Sales' | 'Networking' | 'Personal';

// Added 'automations' to DashboardView to fix type mismatch errors in App.tsx
export type DashboardView = 'overview' | 'pipeline' | 'automations' | 'ai-lab' | 'templates' | 'insights' | 'settings';

export interface FollowUp {
  id: string;
  title: string;
  recipient: string;
  platform: 'Email' | 'LinkedIn' | 'WhatsApp' | 'Other';
  status: 'pending' | 'completed' | 'overdue';
  priority: Priority;
  category: Category;
  dueDate: string;
  notes: string;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  tone: Tone;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

/**
 * Fix: Added AutomationRule interface which was missing and causing import errors in App.tsx
 * and databaseService.ts.
 */
export interface AutomationRule {
  id: string;
  name: string;
  triggerDays: number;
  tone: Tone;
  enabled: boolean;
}
