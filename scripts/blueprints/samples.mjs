export function sampleEvidence(slug) {
  const issue = {
    title: 'Order cancellation delivery',
    body: '## Request\nAllow customers to cancel orders before dispatch.\n## Acceptance criteria\n- Cancellation after dispatch is rejected.\n- Successful cancellation updates status.\n## Delivery objective\nLaunch cancellation safely.\n## Target date\n2026-12-01\n## Work in scope\n- #12\n## Known dependencies\nTesting depends on #12.\n## Release scope\nFrom: v1.0\nTo: v1.1\n## Required evidence\n- Acceptance testing complete for this candidate.\n- Recovery instructions reviewed by the release owner.\n## Audience\nSupport and sales.\n## Exclude\nInternal implementation details.',
    labels: ['bug', 'needs-information'],
    state: 'open',
  };
  return {
    sample: true,
    observed_at: '2026-11-15T12:00:00Z',
    blueprint: slug,
    candidate: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    sources: [
      { id: 'request', kind: 'issue', data: issue },
      { id: 'guidance', kind: 'guidance', data: 'Requests must explain the outcome and measurable acceptance criteria. No automatic changes to business priorities or releases.' },
      { id: 'changes', kind: 'diff', data: [{ filename: 'orders.mjs', additions: 8, deletions: 1, patch: '+if (order.dispatched) throw new Error("Already dispatched");' }] },
    ],
    limitations: ['SYNTHETIC sample, not a live investigation.', 'No external acceptance report or human release approval was supplied.'],
    available_labels: issue.labels,
    linked_items: [12],
    followups: {
      inspect_linked_items: [{ id: 'linked-12', kind: 'issue', data: { title: 'Cancellation API', state: 'open', body: 'Blocked pending payment-provider approval. No acceptance evidence supplied.' } }],
      inspect_tests: [{ id: 'test-source', kind: 'test-source', data: 'test("reject dispatched orders", () => assert.throws(() => cancel({dispatched: true})));' }],
      inspect_checks: [{ id: 'checks', kind: 'checks', data: { sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', check_runs: [{ name: 'unit tests', status: 'completed', conclusion: 'success', head_sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }], statuses: [] } }],
      compare_commits: [{ id: 'release-changes', kind: 'release-changes', data: { base: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', head: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', commits: [{ sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', message: 'Reject cancellation after dispatch (#12)' }], files: ['orders.mjs'] } }],
    },
  };
}
