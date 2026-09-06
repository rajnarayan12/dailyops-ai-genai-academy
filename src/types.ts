export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type UrgencyLevel = 'Immediate' | 'This Week' | 'Upcoming' | 'Flexible';

export interface TaskDeadline {
  item: string;
  timeframe: string;
  urgency: UrgencyLevel;
}

export interface TaskStakeholder {
  nameOrRole: string;
  department?: string;
  responsibilities: string;
}

export interface TaskActionPlanStep {
  step: number;
  phase: string;
  action: string;
  expectedOutcome: string;
}

export interface OperationalAnalysis {
  summary: string;
  priority: PriorityLevel;
  priorityReason: string;
  actionItems: string[];
  deadlines: TaskDeadline[];
  stakeholders: TaskStakeholder[];
  actionPlan: TaskActionPlanStep[];
  suggestedResponse: string;
}

export interface OperationalTaskData extends OperationalAnalysis {
  originalInput: string;
  createdAt: string; // ISO string
}

export interface SavedTaskRecord extends OperationalTaskData {
  id: string;
  userId: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
