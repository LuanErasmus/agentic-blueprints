export const tasks = {
  'azure-deployment-investigator': {
    title: 'Azure Deployment Investigator',
    kind: 'deployment',
    actions: ['inspect_failed_resource', 'inspect_recent_activity', 'stop'],
  },
  'github-issue-triage': {
    title: 'GitHub Issue Triage',
    kind: 'issue',
    actions: ['inspect_linked_items', 'stop'],
  },
  'github-pr-review': {
    title: 'GitHub PR Review',
    kind: 'pr',
    actions: ['inspect_tests', 'inspect_checks', 'stop'],
  },
  'requirements-gap-investigator': {
    title: 'Requirements Gap Investigator',
    kind: 'issue',
    actions: ['inspect_linked_items', 'stop'],
  },
  'test-scenario-planner': {
    title: 'Test Scenario Planner',
    kind: 'either',
    actions: ['inspect_linked_items', 'inspect_tests', 'inspect_checks', 'stop'],
  },
  'delivery-risk-investigator': {
    title: 'Delivery Risk Investigator',
    kind: 'issue',
    actions: ['inspect_linked_items', 'stop'],
  },
  'release-readiness-helper': {
    title: 'Release Readiness Helper',
    kind: 'issue',
    actions: ['inspect_linked_items', 'inspect_checks', 'stop'],
  },
  'pr-confidence-calculator': {
    title: 'PR Confidence Calculator',
    kind: 'pr',
    actions: ['inspect_tests', 'inspect_checks', 'stop'],
  },
  'stakeholder-release-notes-generator': {
    title: 'Stakeholder Release Notes Generator',
    kind: 'issue',
    actions: ['compare_commits', 'inspect_linked_items', 'stop'],
  },
};

export function getTask(slug) {
  if (!Object.hasOwn(tasks, slug)) throw new Error(`Unknown blueprint: ${slug}`);
  return tasks[slug];
}
