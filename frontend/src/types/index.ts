export type MemberLevel = "NORMAL" | "SILVER" | "GOLD";

export interface MemberLevelConfig {
  level: MemberLevel;
  label: string;
  discountRate: number;
  minStayCount: number;
  color: string;
}

export interface Member {
  id: number;
  name: string;
  phone: string;
  level: MemberLevel;
  levelLabel: string;
  stayCount: number;
  discountRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemberLookupResponse {
  exists: boolean;
  member: {
    id: number;
    name: string;
    phone: string;
    level: MemberLevel;
    levelLabel: string;
    stayCount: number;
    discountRate: number;
    nextLevel: string | null;
    staysToNextLevel: number | null;
  } | null;
}

export interface Reservation {
  id: number;
  memberId: number | null;
  guestName: string;
  guestPhone: string;
  checkinDate: string;
  checkoutDate: string;
  siteType: string;
  originalPrice: number;
  discountRate: number;
  finalPrice: number;
  memberLevel: MemberLevel | null;
  memberLevelLabel: string | null;
  status: string;
  isNewMember: boolean;
  createdAt: string;
}

export interface FeatureItem {
  id: number;
  title: string;
  description: string;
  status: string;
  metric: string;
}

export interface KpiItem {
  label: string;
  value: string;
  trend: string;
  tone: string;
}

export interface OperationRecord {
  key: string;
  name: string;
  owner: string;
  status: string;
  metric: string;
  priority: string;
}

export interface OverviewResponse {
  appName: string;
  appCode: string;
  description: string;
  features: FeatureItem[];
  kpis: KpiItem[];
  records: OperationRecord[];
}
