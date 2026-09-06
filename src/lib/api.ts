import { getCurrentUserIdToken } from './firebase';
import { OperationalAnalysis } from '../types';

export async function analyzeOperationalTask(input: string): Promise<OperationalAnalysis> {
  const token = await getCurrentUserIdToken();
  if (!token) {
    throw new Error('You must be signed in with Google to analyze operational tasks.');
  }

  const response = await fetch('/api/analyze-task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ input }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `Server error (${response.status}): Failed to analyze task.`);
  }

  if (!data.success || !data.data) {
    throw new Error('Received incomplete response from server.');
  }

  return data.data as OperationalAnalysis;
}
