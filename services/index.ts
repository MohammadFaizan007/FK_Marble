/**
 * Legacy barrel. Application services live in src/services.
 * Authentication and media uploads are planned for later steps.
 */
export const plannedIntegrations = ["auth", "media"] as const;

export type PlannedIntegration = (typeof plannedIntegrations)[number];
