export type UserRole = 'Developer' | 'Designer' | 'Manager' | 'QA';

interface ActivityMetrics {
  productiveTime: number; // in minutes
  totalTime: number;      // in minutes
  ideTime: number;
  documentationTime: number;
  socialMediaTime: number;
  figmaTime: number;
  researchTime: number;
  emailTime: number;
  meetingTime: number;
  slackTime: number;
  testingToolsTime: number;
  bugReports: number;
  commits: number;
  codeReviews: number;
  idleTime: number;       // consecutive idle minutes
  appSwitchCount: number; // apps per hour
}

export function calculateProductivityScore(role: UserRole, metrics: ActivityMetrics): number {
  let baseScore = (metrics.productiveTime / metrics.totalTime) * 100;

  // Role-based multipliers
  let roleMultiplier = 1.0;
  switch (role) {
    case 'Developer':
      baseScore = (metrics.ideTime * 1.2 + metrics.documentationTime * 1.0 + metrics.socialMediaTime * 0.1) / metrics.productiveTime * 100;
      break;
    case 'Designer':
      baseScore = (metrics.figmaTime * 1.2 + metrics.researchTime * 1.1 + metrics.emailTime * 0.8) / metrics.productiveTime * 100;
      break;
    case 'Manager':
      baseScore = (metrics.meetingTime * 0.9 + metrics.emailTime * 1.0 + metrics.slackTime * 0.8) / metrics.productiveTime * 100;
      break;
    case 'QA':
      baseScore = (metrics.testingToolsTime * 1.3 + metrics.bugReports * 1.2) / metrics.productiveTime * 100;
      break;
  }

  // Adjustments
  let adjustments = 0;
  adjustments += metrics.commits * 5;
  adjustments += metrics.codeReviews * 3;

  if (metrics.idleTime > 120) {
    adjustments -= 10; // >2h consecutive idle
  }

  if (metrics.appSwitchCount > 20) {
    adjustments -= 15; // excessive context switching
  }

  const finalScore = Math.min(Math.max(baseScore + adjustments, 0), 100);
  return finalScore;
}

export function getEfficiencyTier(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excellent', color: '#16a34a' };
  if (score >= 75) return { label: 'Good', color: '#eab308' };
  if (score >= 60) return { label: 'Needs Attention', color: '#ea580c' };
  return { label: 'Intervention Required', color: '#dc2626' };
}
