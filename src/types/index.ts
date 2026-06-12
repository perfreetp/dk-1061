export interface Personality {
  id: string;
  name: string;
  avatar: string;
  category: 'customer_service' | 'sales_coach' | 'training_lecturer';
  industry: string;
  task_type: string;
  compliance_level: number;
  response_style: 'professional' | 'friendly' | 'humorous' | 'formal';
  description: string;
  rating: number;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

export interface CandidateItem {
  id: string;
  personality_id: string;
  user_id: string;
  added_at: string;
  personality?: Personality;
}

export interface PurchaseApplication {
  id: string;
  user_id: string;
  personality_id: string;
  purpose: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  approved_at?: string;
  personality?: Personality;
}

export interface Approval {
  id: string;
  application_id: string;
  approver_id: string;
  decision: 'approve' | 'reject';
  comment: string;
  approved_at: string;
}

export interface UsageLog {
  id: string;
  personality_id: string;
  user_id: string;
  call_count: number;
  date: string;
}

export interface Feedback {
  id: string;
  personality_id: string;
  user_id: string;
  satisfaction_score: number;
  comment: string;
  is_abnormal: boolean;
  created_at: string;
}

export interface TrialResult {
  personality_id: string;
  personality_name: string;
  response: string;
  latency: number;
  tokens_used: number;
}

export interface FilterParams {
  industry: string[];
  taskType: string[];
  complianceLevel: number[];
  responseStyle: string[];
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  filters: FilterParams;
  candidateList: CandidateItem[];
  compareList: Personality[];
  trialResults: TrialResult[];
  applications: PurchaseApplication[];
  usageData: UsageLog[];
  feedbackData: Feedback[];
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'approver' | 'admin';
}

export const INDUSTRY_OPTIONS = [
  '金融',
  '医疗',
  '教育',
  '电商',
  '零售',
  '制造',
  '科技',
  '物流',
];

export const TASK_TYPE_OPTIONS = [
  '客户咨询',
  '售后支持',
  '销售跟进',
  '产品培训',
  '员工培训',
  '技术支持',
];

export const RESPONSE_STYLE_OPTIONS = [
  { value: 'professional', label: '专业' },
  { value: 'friendly', label: '友好' },
  { value: 'humorous', label: '幽默' },
  { value: 'formal', label: '正式' },
];

export const COMPLIANCE_LEVELS = [1, 2, 3, 4, 5];
