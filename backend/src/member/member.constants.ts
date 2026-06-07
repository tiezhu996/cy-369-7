export enum MemberLevel {
  NORMAL = "NORMAL",
  SILVER = "SILVER",
  GOLD = "GOLD",
}

export const MEMBER_LEVEL_CONFIG = {
  [MemberLevel.NORMAL]: {
    label: "普通会员",
    discountRate: 1.0,
    minStayCount: 0,
    color: "default",
  },
  [MemberLevel.SILVER]: {
    label: "银卡会员",
    discountRate: 0.9,
    minStayCount: 3,
    color: "blue",
  },
  [MemberLevel.GOLD]: {
    label: "金卡会员",
    discountRate: 0.8,
    minStayCount: 10,
    color: "gold",
  },
};

export function calculateLevelByStayCount(stayCount: number): MemberLevel {
  if (stayCount >= MEMBER_LEVEL_CONFIG[MemberLevel.GOLD].minStayCount) {
    return MemberLevel.GOLD;
  }
  if (stayCount >= MEMBER_LEVEL_CONFIG[MemberLevel.SILVER].minStayCount) {
    return MemberLevel.SILVER;
  }
  return MemberLevel.NORMAL;
}
