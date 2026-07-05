'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@favorit/types';
import { apiGet } from '@/lib/api';

export interface AdminDashboardStats {
  childrenCount: number;
  parentsCount: number;
  coachesCount: number;
  groupsCount: number;
  activeSubscriptions: number;
  pendingPayments: number;
  pendingRegistrations: number;
  upcomingSessions: number;
  trialRegistrations: number;
  recentOrders: number;
  unreadNotifications: number;
}

export interface ParentDashboardStats {
  children: Array<{
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    photo: string | null;
    groups: Array<{ group: { id: string; name: string } }>;
    subscriptions: Array<{
      id: string;
      status: string;
      remainingSessions: number;
      endDate: string;
      plan: { name: string; sessions: number };
    }>;
  }>;
  upcomingSessions: Array<{
    id: string;
    title: string | null;
    venue: string;
    startTime: string;
    endTime: string;
    group: { name: string };
  }>;
  unreadNotifications: number;
}

export interface CoachMonthSummary {
  totalSessions: number;
  completedSessions: number;
  totalPresent: number;
  totalMarked: number;
  averageAttendance: number;
}

export interface CoachCalendarSession {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string;
  venue: string;
  status: string;
  group: { id: string; name: string };
  rosterSize: number;
  presentCount: number;
  absentCount: number;
  markedCount: number;
}

export interface CoachMonthCalendar {
  year: number;
  month: number;
  summary: CoachMonthSummary;
  sessions: CoachCalendarSession[];
}

export interface CoachDashboardStats {
  groups: Array<{ id: string; name: string; _count?: { children: number } }>;
  nextSession: {
    id: string;
    title: string | null;
    venue: string;
    startTime: string;
    endTime: string;
    group: { name: string };
  } | null;
  todaySessions: Array<{
    id: string;
    title: string | null;
    venue: string;
    startTime: string;
    endTime: string;
    group: { name: string };
  }>;
  monthSummary: CoachMonthSummary;
}

export type DashboardStats = AdminDashboardStats | ParentDashboardStats | CoachDashboardStats;

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<DashboardStats>>('/dashboard');
      return res.data!;
    },
    refetchInterval: 20_000,
    staleTime: 5_000,
  });
}
