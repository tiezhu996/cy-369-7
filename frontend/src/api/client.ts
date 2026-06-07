import { API_BASE_URL } from "../constants/app";
import type {
  OverviewResponse,
  Member,
  MemberLevelConfig,
  MemberLookupResponse,
  Reservation,
  MemberLevel,
} from "../types";

export async function fetchOverview(): Promise<OverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/overview`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Overview request failed: ${response.status}`);
  }

  return response.json() as Promise<OverviewResponse>;
}

export async function fetchMembers(): Promise<Member[]> {
  const response = await fetch(`${API_BASE_URL}/members`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Members request failed: ${response.status}`);
  }

  return response.json() as Promise<Member[]>;
}

export async function fetchMemberLevelConfig(): Promise<MemberLevelConfig[]> {
  const response = await fetch(`${API_BASE_URL}/members/levels/config`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Member level config request failed: ${response.status}`);
  }

  return response.json() as Promise<MemberLevelConfig[]>;
}

export async function lookupMemberByPhone(
  phone: string,
): Promise<MemberLookupResponse> {
  const response = await fetch(
    `${API_BASE_URL}/reservations/lookup?phone=${encodeURIComponent(phone)}`,
    {
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(`Member lookup request failed: ${response.status}`);
  }

  return response.json() as Promise<MemberLookupResponse>;
}

export async function createMember(data: {
  name: string;
  phone: string;
  level?: MemberLevel;
  stayCount?: number;
}): Promise<Member> {
  const response = await fetch(`${API_BASE_URL}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Create member failed: ${response.status}`);
  }

  return response.json() as Promise<Member>;
}

export async function updateMember(
  id: number,
  data: {
    name?: string;
    phone?: string;
    level?: MemberLevel;
    stayCount?: number;
  },
): Promise<Member> {
  const response = await fetch(`${API_BASE_URL}/members/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Update member failed: ${response.status}`);
  }

  return response.json() as Promise<Member>;
}

export async function deleteMember(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/members/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Delete member failed: ${response.status}`);
  }
}

export async function fetchReservations(): Promise<Reservation[]> {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Reservations request failed: ${response.status}`);
  }

  return response.json() as Promise<Reservation[]>;
}

export async function createReservation(data: {
  guestName: string;
  guestPhone: string;
  checkinDate: string;
  checkoutDate: string;
  siteType: string;
  originalPrice: number;
}): Promise<Reservation> {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Create reservation failed: ${response.status}`,
    );
  }

  return response.json() as Promise<Reservation>;
}
