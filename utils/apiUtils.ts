import type { CreateDecisionPayload, Decision } from '@/types/decision';
import axios from 'axios';
import { getDeviceId } from './deviceId';

const requestUtil = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
});

export async function createDecision(
  payload: CreateDecisionPayload
): Promise<Decision> {
  const body: Record<string, unknown> = {
    title: payload.title,
    options: payload.options,
  };
  if (payload.closesAt) {
    body.closesAt = payload.closesAt;
  }
  const response = await requestUtil.post<Decision>('/api/decisions', body);
  return response.data;
}

export async function getDecision(id: string): Promise<Decision> {
  const deviceId = await getDeviceId();
  const response = await requestUtil.get<Decision>(`/api/decisions/${id}`, {
    headers: { 'X-Device-Id': deviceId },
  });
  return response.data;
}

export async function submitVote(
  decisionId: string,
  optionId: string
): Promise<Decision> {
  const deviceId = await getDeviceId();
  const response = await requestUtil.post<Decision>(
    `/api/decisions/${decisionId}/vote`,
    { optionId },
    { headers: { 'X-Device-Id': deviceId } }
  );
  return response.data;
}
