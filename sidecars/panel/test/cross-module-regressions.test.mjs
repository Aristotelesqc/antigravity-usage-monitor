import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { backendHarness } from './backend-harness.mjs';
import {
  extractContextBreakdown,
  extractModelSteps,
  normalizeCachedStep,
} from '../trajectory-metrics.mjs';
import {
  formatCountdown,
  formatUsd,
  speedReasonText,
} from '../src/core/formatters.js';
import { createReactiveStore } from '../src/core/reactive.js';
import { buildBundle, stripModuleSyntax } from '../scripts/build-bundle.mjs';

const nowMs = Date.now();
const nowIso = new Date(nowMs - 5_000).toISOString();
const doneIso = new Date(nowMs - 3_000).toISOString();
const promoMs = Date.parse('2026-11-17T12:00:00Z');
const promoNowIso = new Date(promoMs - 5_000).toISOString();
const promoDoneIso = new Date(promoMs - 3_000).toISOString();

test('BUG-01 & INCON-01: Google-proxied Claude/GPT/o-series never misclassify as Gemini, and M429/M322/M149/M20 resolve accurately', () => {
  const h = backendHarness({
    clock: () => promoMs,
    userStatus: {
      cascadeModelConfigData: {
        clientModelConfigs: [
          {
            modelOrAlias: { model: 'MODEL_CLAUDE_PROXY' },
            label: 'Claude Opus 4.6 (Google Vertex)',
            quotaInfo: { remainingFraction: 0.75, resetTime: new Date(nowMs + 3600_000).toISOString() },
          },
        ],
      },
    },
  });

  const infoClaude = h.resolveModelInfo('claude-opus-4-6', new Map(), 'API_PROVIDER_GOOGLE_GEMINI');
  assert.equal(infoClaude.family, 'Claude');
  const infoO3 = h.resolveModelInfo('o3-mini', new Map(), 'API_PROVIDER_GOOGLE_GEMINI');
  assert.equal(infoO3.family, 'GPT');

  // Calling resolveModelInfo with omitted dynamicModelMap must not throw (BUG-03)
  const infoDefaultMap = h.resolveModelInfo('MODEL_PLACEHOLDER_M320');
  assert.equal(infoDefaultMap.modelId, 'gemini-3.8-flash-low');
  assert.equal(infoDefaultMap.pricing?.input, 0.3);

  const m429 = h.resolveModelInfo('MODEL_PLACEHOLDER_M429', new Map(), 'API_PROVIDER_GOOGLE_GEMINI');
  assert.equal(m429.modelId, 'gemini-4-carbon-high');
  assert.equal(m429.shortName, 'carbon-4-high');

  const m322 = h.resolveModelInfo('MODEL_PLACEHOLDER_M322', new Map(), 'API_PROVIDER_GOOGLE_GEMINI');
  assert.equal(m322.modelId, 'gemini-3.8-flash-tiered');
  assert.equal(
    h.computeStepCost(
      {
        modelKey: 'MODEL_PLACEHOLDER_M322',
        inputTokens: 1_000_000,
        cacheReadTokens: 0,
        outputTokens: 0,
      },
      m322.pricing
    ),
    0.75
  );

  const m149 = h.resolveModelInfo('MODEL_PLACEHOLDER_M149', new Map(), 'API_PROVIDER_GOOGLE_GEMINI');
  assert.equal(m149.modelId, 'gemini-3.5-flash-high');

  const m20 = h.resolveModelInfo('MODEL_PLACEHOLDER_M20', new Map(), 'API_PROVIDER_GOOGLE_GEMINI');
  assert.equal(m20.modelId, 'gemini-3.5-flash');

  // Gemini Hydrogen ($1.50/$0.075/$7.50) & Helix ($0.30/$0.015/$2.50), shared Gemini pool
  const dynHydrogenMap = new Map([
    ['MODEL_PLACEHOLDER_M480', { modelId: '', label: 'Gemini 4 Hydrogen (High)' }],
    ['MODEL_PLACEHOLDER_M481', { modelId: '', label: 'Gemini 4 Hydrogen (Low)' }],
    ['MODEL_PLACEHOLDER_M482', { modelId: '', label: 'Gemini 4 Helix' }],
  ]);
  const hydroHigh = h.resolveModelInfo('MODEL_PLACEHOLDER_M480', dynHydrogenMap);
  assert.equal(hydroHigh.family, 'Gemini');
  assert.equal(hydroHigh.shortName, 'hydrogen-4-high');
  assert.deepEqual(
    { i: hydroHigh.pricing?.input, c: hydroHigh.pricing?.cache, o: hydroHigh.pricing?.output },
    { i: 1.5, c: 0.075, o: 7.5 }
  );
  const hydroLow = h.resolveModelInfo('MODEL_PLACEHOLDER_M481', dynHydrogenMap);
  assert.equal(hydroLow.shortName, 'hydrogen-4-low');
  assert.deepEqual(
    { i: hydroLow.pricing?.input, c: hydroLow.pricing?.cache, o: hydroLow.pricing?.output },
    { i: 1.5, c: 0.075, o: 7.5 }
  );
  const hydroCodename = h.resolveModelInfo('gemini-hydrogen');
  assert.equal(hydroCodename.family, 'Gemini');
  assert.equal(hydroCodename.label, 'Gemini Hydrogen');
  assert.equal(hydroCodename.pricing?.input, 1.5);
  assert.equal(hydroCodename.pricing?.output, 7.5);

  const helixInfo = h.resolveModelInfo('MODEL_PLACEHOLDER_M482', dynHydrogenMap);
  assert.equal(helixInfo.family, 'Gemini');
  assert.equal(helixInfo.shortName, 'helix-4');
  assert.deepEqual(
    { i: helixInfo.pricing?.input, c: helixInfo.pricing?.cache, o: helixInfo.pricing?.output },
    { i: 0.3, c: 0.015, o: 2.5 }
  );
  const helixCodename = h.resolveModelInfo('gemini-helix');
  assert.equal(helixCodename.family, 'Gemini');
  assert.equal(helixCodename.label, 'Gemini Helix');
  assert.equal(helixCodename.pricing?.output, 2.5);

  const { quotaPoolsMap } = h.buildOfficialQuotaPools(null, [
    {
      modelOrAlias: { model: 'MODEL_PLACEHOLDER_M480' },
      label: 'Gemini 4 Hydrogen (High)',
      quotaInfo: { remainingFraction: 0.8, resetTime: new Date(nowMs + 3600_000).toISOString() },
    },
    {
      modelOrAlias: { model: 'MODEL_PLACEHOLDER_M482' },
      label: 'Gemini 4 Helix',
      quotaInfo: { remainingFraction: 0.8, resetTime: new Date(nowMs + 3600_000).toISOString() },
    },
  ]);
  assert.equal(quotaPoolsMap.has('Hydrogen'), false, 'Hydrogen has no dedicated quota pool');
  assert.equal(quotaPoolsMap.has('Helix'), false, 'Helix has no dedicated quota pool');
  assert.equal(quotaPoolsMap.get('Gemini')?.isAvailable, true);
});

test('BUG-02 & BUG-11: ide:<uuid> external sessions do not double-count live conversations, cross-account entries are isolated, and orphan subagents never leak to top-level list', async () => {
  const stepObj = {
    status: 'CORTEX_STEP_STATUS_DONE',
    metadata: {
      sourceTrajectoryStepInfo: { stepIndex: 1 },
      createdAt: nowIso,
      completedAt: doneIso,
      modelUsage: {
        model: 'MODEL_PLACEHOLDER_M318',
        inputTokens: '10000',
        cacheReadTokens: '20000',
        outputTokens: '5000',
      },
    },
  };
  const h = backendHarness({
    userStatus: { email: 'alice@example.com' },
    deepStats: {
      accountName: 'alice@example.com',
      perConvo: {
        // Same conversation ID as live 'abcd-1234' (case-insensitive, prefixed with 'ide:') -> must deduplicate!
        'ide:AbCd-1234': {
          accountName: 'alice@example.com',
          appSource: 'ide',
          entries: [
            { ts: nowIso, model: 'MODEL_PLACEHOLDER_M318', inp: 10000, cache: 20000, out: 5000, reasoning: 0 },
            { ts: doneIso, model: 'MODEL_PLACEHOLDER_M318', inp: 10000, cache: 20000, out: 5000, reasoning: 0 },
          ],
        },
        // Different account -> must be excluded when logged in as alice@example.com!
        'ide:bob-conv': {
          accountName: 'bob@example.com',
          appSource: 'ide',
          entries: [
            { ts: nowIso, model: 'MODEL_PLACEHOLDER_M318', inp: 99000, cache: 0, out: 1000, reasoning: 0 },
          ],
        },
      },
    },
    cache: {
      'orphan-sub': {
        accountName: 'bob@example.com',
        isSubagent: true,
        parentCascadeId: 'deleted-parent',
        signature: 'v10-model-identity:sub',
        steps: extractModelSteps([stepObj]),
      },
    },
    summaries: {
      'abcd-1234': { stepCount: 1, lastModifiedTime: doneIso, status: 'IDLE' },
    },
    trajectories: {
      'abcd-1234': { trajectory: { steps: [stepObj] } },
    },
  });

  const p = await h.buildTelemetryPayloadInternal('abcd-1234', false, { range: 'all' });
  // ide:AbCd-1234 has 2 entries vs live abcd-1234's 1 step -> deduplicated (no 1 + 2 = 3 double counting!), bob excluded!
  assert.equal(p.consumption.account.conversationsCount, 1);
  assert.equal(p.consumption.account.calls, 2);
  assert.equal(p.consumption.account.totalTokens, 70_000);
  assert.equal(
    p.conversations.some((c) => c.cascadeId === 'orphan-sub'),
    false,
    'orphan subagent must not appear in top-level conversation dropdown'
  );
});

test('BUG-03, BUG-12 & BUG-16: negative/NaN token sanitization, deferred costUsd rounding, and dynamicModelMap default', async () => {
  const badStep = {
    status: 'CORTEX_STEP_STATUS_DONE',
    metadata: {
      sourceTrajectoryStepInfo: { stepIndex: 1 },
      createdAt: nowIso,
      completedAt: doneIso,
      modelUsage: {
        model: 'MODEL_PLACEHOLDER_M318',
        inputTokens: '-5000',
        cacheReadTokens: 'NaN',
        outputTokens: '1000',
        thinkingOutputTokens: '2500',
      },
    },
  };
  const extracted = extractModelSteps([badStep]);
  assert.equal(extracted[0].inputTokens, 0);
  assert.equal(extracted[0].cacheReadTokens, 0);
  assert.equal(extracted[0].outputTokens, 1000);
  assert.equal(extracted[0].thinkingTokens, 1000);
  assert.equal(extracted[0].responseTokens, 0);
  assert.equal(normalizeCachedStep({ ...extracted[0], inputTokens: -99 }).inputTokens, 0);
  assert.equal(normalizeCachedStep(null), null);

  // Micro-steps: 100 steps * (1067 output * $3.75 / 1M = $0.00400125) = $0.40 (previously rounded per-step to $0.00 -> $0.00!)
  const microSteps = Array.from({ length: 100 }, (_, idx) => ({
    status: 'CORTEX_STEP_STATUS_DONE',
    metadata: {
      sourceTrajectoryStepInfo: { stepIndex: idx + 1 },
      createdAt: promoNowIso,
      completedAt: promoDoneIso,
      modelUsage: {
        model: 'MODEL_PLACEHOLDER_M318', // gemini-3.8-flash-high: $0.75/1M input, $3.75/1M output
        inputTokens: '0',
        cacheReadTokens: '0',
        outputTokens: '1067',
      },
    },
  }));
  const h = backendHarness({
    clock: () => promoMs,
    summaries: { micro: { stepCount: 100, lastModifiedTime: promoDoneIso, status: 'IDLE' } },
    trajectories: { micro: { trajectory: { steps: microSteps } } },
  });
  const p = await h.buildTelemetryPayloadInternal('micro', false, { range: 'today' });
  assert.equal(p.consumption.account.costUsd, 0.4);
});

test('BUG-04 & BUG-10: failed RUNNING trajectory fetch enters cooldown instead of hammering RPC every poll, cleared by forceRefresh', async () => {
  const h = backendHarness({
    summaries: { run1: { stepCount: 2, lastModifiedTime: doneIso, status: 'CASCADE_RUN_STATUS_RUNNING' } },
    trajectories: { run1: new Error('LS timeout') },
    quotaSummary: new Error('Quota RPC down'),
  });

  await h.buildTelemetryPayloadInternal('run1', false);
  const callsAfterFirst = h.state.calls.filter((c) => c.method === 'GetCascadeTrajectory').length;
  const quotaCallsAfterFirst = h.state.calls.filter((c) => c.method === 'RetrieveUserQuotaSummary').length;
  assert.equal(callsAfterFirst, 1);
  assert.equal(quotaCallsAfterFirst, 1);

  // Immediate second background poll must respect cooldown for both trajectory and quota RPC
  await h.buildTelemetryPayloadInternal('run1', false);
  assert.equal(h.state.calls.filter((c) => c.method === 'GetCascadeTrajectory').length, 1);
  assert.equal(h.state.calls.filter((c) => c.method === 'RetrieveUserQuotaSummary').length, 1);

  // Manual forceRefresh=true bypasses cooldown immediately
  await h.buildTelemetryPayloadInternal('run1', true);
  assert.equal(h.state.calls.filter((c) => c.method === 'GetCascadeTrajectory').length, 2);
  assert.equal(h.state.calls.filter((c) => c.method === 'RetrieveUserQuotaSummary').length, 2);
});

test('BUG-09, BUG-14 & BUG-15: SemVer 2.0 prerelease/build ordering, future-only exhausted quota inference, and <6h dual-bucket classification', async () => {
  const h = backendHarness({
    quotaSummary: {
      groups: [
        {
          displayName: 'Gemini',
          buckets: [
            {
              // Omitted remainingFraction with epoch-0 resetTime must NOT falsely report 0% remaining!
              resetTime: '1970-01-01T00:00:00Z',
            },
          ],
        },
        {
          displayName: 'Claude & GPT',
          buckets: [
            {
              remainingFraction: 0.4,
              resetTime: new Date(nowMs + 2 * 3600_000).toISOString(),
            },
            {
              remainingFraction: 0.8,
              // Weekly bucket that happens to be 4h away from resetting!
              resetTime: new Date(nowMs + 4 * 3600_000).toISOString(),
            },
          ],
        },
      ],
    },
  });

  assert.equal(h.compareSemver('1.4.2+20261110', '1.4.2'), 0);
  assert.equal(h.compareSemver('1.5.0-beta.2', '1.5.0-alpha.10'), 1);
  assert.equal(h.compareSemver('1.5.0-alpha.1', '1.5.0-alpha.beta'), -1);

  const p = await h.buildTelemetryPayloadInternal('');
  const geminiPool = p.quotas.pools.find((x) => x.poolKey === 'Gemini');
  assert.ok(geminiPool);
  assert.equal(geminiPool.isAvailable, false, 'epoch-0 omitted remainingFraction must not create fake 0% exhausted pool');
  assert.equal(geminiPool.remainingPct, null);
  assert.equal(geminiPool.usedPct, null);

  const claudePool = p.quotas.pools.find((x) => x.poolKey === 'Claude & GPT');
  assert.ok(claudePool);
  assert.equal(claudePool.remainingPct, 40);
  assert.equal(claudePool.weeklyRemainingPct, 80);

  assert.equal(formatCountdown(new Date(nowMs + 30_000).toISOString(), nowMs), '<1分钟后重置');
  assert.equal(formatCountdown('1969-12-31T23:59:59Z', nowMs), '未知重置时间');
  assert.equal(formatUsd(0.0004, { precise: true }), '<$0.001');
  assert.equal(formatUsd(12.34, { unpricedCalls: 1, compactPending: true }), '$12.34');
  assert.equal(speedReasonText('short_timing'), '耗时过短 (<0.5s)');
});

test('BUG-17 & CANCEL-06: extractContextBreakdown classifies messagePrompts when children are empty and blocks post-compaction carryover', () => {
  const ctx = extractContextBreakdown({
    chatStartMetadata: {
      contextWindowMetadata: {
        estimatedTokensUsed: 10000,
        tokenBreakdown: {
          groups: [
            { type: 'TOKEN_TYPE_SYSTEM_PROMPT', numTokens: 2000 },
            { type: 'TOKEN_TYPE_CHAT_MESSAGES', numTokens: 8000, children: [] },
          ],
        },
      },
    },
    messagePrompts: [
      { source: 'CHAT_MESSAGE_SOURCE_USER', prompt: '<USER_REQUEST>hello world</USER_REQUEST>' },
      { source: 'CHAT_MESSAGE_SOURCE_MODEL', prompt: 'Assistant reply content here!' },
    ],
  });
  assert.ok(ctx);
  assert.equal(ctx.systemPromptTokens, 2000);
  assert.ok(ctx.userInputTokens > 0);
  assert.ok(ctx.assistantTokens > 0);
  assert.equal(ctx.userInputTokens + ctx.assistantTokens, 8000);

  const stepsWithTrailingCheckpoint = extractModelSteps(
    [
      {
        status: 'CORTEX_STEP_STATUS_DONE',
        metadata: {
          sourceTrajectoryStepInfo: { stepIndex: 1 },
          createdAt: nowIso,
          completedAt: doneIso,
          modelUsage: { model: 'MODEL_PLACEHOLDER_M318', inputTokens: '180000', outputTokens: '500' },
        },
      },
      {
        type: 'CORTEX_STEP_TYPE_CHECKPOINT',
        status: 'CORTEX_STEP_STATUS_DONE',
        metadata: {
          sourceTrajectoryStepInfo: { stepIndex: 2 },
          createdAt: nowIso,
          completedAt: doneIso,
          modelUsage: { model: 'MODEL_PLACEHOLDER_M318', inputTokens: '180000', outputTokens: '1200' },
        },
      },
    ],
    [
      {
        stepIndices: [1],
        chatModel: {
          chatStartMetadata: {
            contextWindowMetadata: {
              estimatedTokensUsed: 180_000,
              tokenBreakdown: {
                groups: [{ type: 'TOKEN_TYPE_CHAT_MESSAGES', numTokens: 180_000 }],
              },
            },
          },
        },
      },
    ]
  );
  assert.equal(stepsWithTrailingCheckpoint.length, 2);
  assert.equal(stepsWithTrailingCheckpoint[1].isCompactionStep, true);
  assert.equal(
    stepsWithTrailingCheckpoint[1].contextBreakdown,
    null,
    'compaction checkpoint must not inherit pre-compaction 180k contextBreakdown'
  );
});

test('BUG-20 & BUG-24: reactive store microtask deduplication, stripModuleSyntax safety, and IIFE bundle isolation', async () => {
  const store = createReactiveStore({ a: 1, b: 2 });
  let calls = 0;
  store.subscribe((s) => s.a + s.b, () => {
    calls += 1;
  }, { immediate: false });

  store.setState({ a: 10 });
  store.setState({ b: 20 });
  await new Promise((r) => queueMicrotask(r));
  assert.equal(calls, 1, 'multiple setState calls in same microtask must batch into 1 subscriber flush');

  const trickyModule = [
    "import './side-effect.js';",
    "import { foo,\n  bar } from './multi.js';",
    'const tpl = `\nimport { keepMe } from "tpl";\nexport const KEEP_ME = 42;\n`;',
    'export async function runTask() { return tpl; }',
    'export { runTask };',
  ].join('\n');

  const stripped = stripModuleSyntax(trickyModule);
  assert.ok(stripped.includes('import { keepMe } from "tpl"'));
  assert.ok(stripped.includes('export const KEEP_ME = 42'));
  assert.equal(/^\s*import\s/m.test(stripped.replace(/`[\s\S]*?`/g, '')), false);
  assert.doesNotThrow(() => new vm.Script(stripped));

  const appBundle = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  assert.ok(appBundle.startsWith('(() => {\n\'use strict\';'));
  assert.ok(appBundle.trimEnd().endsWith('})();'));
});

test('bundle validation rejects incompatible imports and duplicate bindings before touching output', (t) => {
  const tempDir = fs.mkdtempSync(fileURLToPath(new URL('./.bundle-test-', import.meta.url)));
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 }));
  for (const dir of ['src', 'shared']) {
    fs.cpSync(new URL(`../${dir}/`, import.meta.url), join(tempDir, dir), { recursive: true });
  }
  const outputs = ['app.js', 'styles.css', 'index.html'];
  for (const file of outputs) fs.writeFileSync(join(tempDir, file), file);

  const iconSource = join(tempDir, 'src', 'icons', 'svgRegistry.js');
  const original = fs.readFileSync(iconSource, 'utf8');
  for (const [prefix, error] of [
    ["import { SVG_NS /* comment */ as ns } from './SvgIcon.js';", /svgRegistry\.js.*without aliases/],
    ["import { SVG_NS } from './SvgIcon.js';", /svgRegistry\.js.*SvgIcon\.js.*earlier in jsOrder/],
    ["import './missing.js';", /svgRegistry\.js.*missing\.js.*earlier in jsOrder/],
    ['const SVG_NS = "duplicate";', /Identifier 'SVG_NS' has already been declared/],
  ]) {
    fs.writeFileSync(iconSource, `${prefix}\n${original}`);
    assert.throws(() => buildBundle(tempDir), error);
    for (const file of outputs) {
      assert.equal(fs.readFileSync(join(tempDir, file), 'utf8'), file);
    }
  }
});

test('Compaction liveActivity: detects in-progress & completed CHECKPOINT over pre-compaction tool operations across RPC and transcript.jsonl', async () => {
  const convId = '4432b724-3e1e-4421-a375-c6855a7b7b37';

  // Pre-compaction steps (matching real-world step 0..2: planner edit_file x2 + 2 completed tool results)
  const rpcPreCompactionSteps = [
    {
      type: 'CORTEX_STEP_TYPE_PLANNER_RESPONSE',
      status: 'CORTEX_STEP_STATUS_DONE',
      metadata: {
        createdAt: '2026-11-11T02:18:21Z',
        finishedGeneratingAt: '2026-11-11T02:18:35Z',
        modelUsage: {
          model: 'MODEL_PLACEHOLDER_M318',
          inputTokens: '2918',
          cacheReadTokens: '252465',
          outputTokens: '814',
        },
      },
      plannerResponse: {
        toolCalls: [
          { name: 'edit_file', argumentsJson: JSON.stringify({ Path: 'f:/repo/backend-harness.mjs' }) },
          { name: 'edit_file', argumentsJson: JSON.stringify({ Path: 'f:/repo/04-post-fix-verify.mjs' }) },
        ],
      },
    },
    {
      type: 'CORTEX_STEP_TYPE_CODE_ACTION',
      status: 'CORTEX_STEP_STATUS_DONE',
      metadata: { createdAt: '2026-11-11T02:18:35Z', completedAt: '2026-11-11T02:18:38Z' },
    },
    {
      type: 'CORTEX_STEP_TYPE_CODE_ACTION',
      status: 'CORTEX_STEP_STATUS_DONE',
      metadata: { createdAt: '2026-11-11T02:18:35Z', completedAt: '2026-11-11T02:18:40Z' },
    },
  ];

  // transcript.jsonl still ends at step_index 2 (since CHECKPOINT only flushes to transcript.jsonl when DONE)
  const transcriptPreFlush = [
    {
      step_index: 0,
      source: 'MODEL',
      type: 'PLANNER_RESPONSE',
      status: 'DONE',
      created_at: '2026-11-11T02:18:21Z',
      tool_calls: [
        { name: 'edit_file', args: { Path: '"f:\\\\repo\\\\backend-harness.mjs"' } },
        { name: 'edit_file', args: { Path: '"f:\\\\repo\\\\04-post-fix-verify.mjs"' } },
      ],
    },
    {
      step_index: 1,
      source: 'MODEL',
      type: 'GENERIC',
      status: 'DONE',
      created_at: '2026-11-11T02:18:35Z',
      content: 'Created At: 2026-11-11T11:18:35+09:00\nCompleted At: 2026-11-11T11:18:38+09:00\nMade 1 replacement',
    },
    {
      step_index: 2,
      source: 'MODEL',
      type: 'GENERIC',
      status: 'DONE',
      created_at: '2026-11-11T02:18:35Z',
      content: 'Created At: 2026-11-11T11:18:35+09:00\nCompleted At: 2026-11-11T11:18:40+09:00\nMade 1 replacement',
    },
  ];

  // Phase 1: In-progress CORTEX_STEP_TYPE_CHECKPOINT in RPC WITHOUT metadata.createdAt yet + trailing MEMENTO
  const h = backendHarness({
    summaries: {
      [convId]: {
        stepCount: 4,
        lastModifiedTime: '2026-11-11T02:18:35Z',
        status: 'CASCADE_RUN_STATUS_RUNNING',
        annotations: { title: 'Audit & Fix Session' },
      },
    },
    trajectories: {
      [convId]: {
        trajectory: {
          steps: [
            ...rpcPreCompactionSteps,
            {
              type: 'CORTEX_STEP_TYPE_CHECKPOINT',
              status: 'CORTEX_STEP_STATUS_RUNNING',
              metadata: {},
            },
            {
              type: 'CORTEX_STEP_TYPE_MEMENTO',
              status: 'CORTEX_STEP_STATUS_DONE',
              metadata: { createdAt: '2026-11-11T02:18:40Z' },
            },
          ],
        },
      },
    },
    transcripts: {
      [convId]: transcriptPreFlush,
    },
  });

  const pCompacting = await h.buildTelemetryPayloadInternal(convId);
  assert.equal(pCompacting.activeConversation.liveActivity.phase, 'compacting');
  assert.equal(pCompacting.activeConversation.liveActivity.label, '上下文压缩');
  assert.equal(
    pCompacting.activeConversation.liveActivity.startedAtMs,
    Date.parse('2026-11-11T02:18:40Z'),
    'uses previous tool completion timestamp when in-progress CHECKPOINT lacks createdAt'
  );
  assert.equal(pCompacting.runningConversations[0].mainActivity.phase, 'compacting');
  assert.equal(pCompacting.runningConversations[0].mainActivity.label, '上下文压缩');

  // Phase 2: CHECKPOINT finishes (status=DONE in both RPC & transcript.jsonl) while resuming before next PLANNER_RESPONSE
  h.state.trajectories[convId] = {
    trajectory: {
      steps: [
        ...rpcPreCompactionSteps,
        {
          type: 'CORTEX_STEP_TYPE_CHECKPOINT',
          status: 'CORTEX_STEP_STATUS_DONE',
          metadata: {
            createdAt: '2026-11-11T02:18:40Z',
            finishedGeneratingAt: '2026-11-11T02:19:33Z',
            modelUsage: {
              model: 'MODEL_PLACEHOLDER_M318',
              inputTokens: '3082',
              cacheReadTokens: '254224',
              outputTokens: '4627',
            },
          },
        },
      ],
    },
  };
  h.state.transcripts[convId] = [
    ...transcriptPreFlush,
    {
      step_index: 3,
      source: 'SYSTEM',
      type: 'CHECKPOINT',
      status: 'DONE',
      created_at: '2026-11-11T02:18:40Z',
      content: '# Resuming from a compaction\n...',
    },
  ];
  h.state.transcriptMtimeMs = 2;

  const pResuming = await h.buildTelemetryPayloadInternal(convId);
  assert.equal(pResuming.activeConversation.liveActivity.phase, 'compacting');
  assert.equal(pResuming.activeConversation.liveActivity.label, '上下文压缩');
  assert.equal(pResuming.activeConversation.liveActivity.detail, '已完成压缩，正在恢复推理');
  assert.equal(
    pResuming.activeConversation.liveActivity.startedAtMs,
    Date.parse('2026-11-11T02:19:33Z')
  );

  // Phase 3: Even when RPC fails/cools down and ONLY transcript.jsonl (with status="DONE" CHECKPOINT) is available,
  // it STILL detects compaction instead of regressing to pre-compaction "修改文件"
  h.state.trajectories[convId] = new Error('temporary RPC timeout');
  const pTranscriptOnly = await h.buildTelemetryPayloadInternal(convId, true);
  assert.equal(pTranscriptOnly.activeConversation.liveActivity.phase, 'compacting');
  assert.equal(pTranscriptOnly.activeConversation.liveActivity.label, '上下文压缩');
});

test('panel typography scales all view/table/chart CSS rules via --fs-* tokens without hardcoded px sizes', () => {
  const stylesDir = fileURLToPath(new URL('../src/styles', import.meta.url));
  const viewCssFiles = [
    'controls.css',
    'views-overview.css',
    'views-tables.css',
    'views-consumption.css',
    'views-settings.css',
  ];
  for (const file of viewCssFiles) {
    const css = fs.readFileSync(join(stylesDir, file), 'utf8');
    const rawFontLines = css
      .split(/\r?\n/)
      .filter((line) => /font-size\s*:/.test(line) && !/var\(--fs-/.test(line));
    assert.deepEqual(
      rawFontLines,
      [],
      `${file} must route every font-size declaration through scalable --fs-* tokens`
    );
  }
  const tokensCss = fs.readFileSync(join(stylesDir, 'tokens.css'), 'utf8');
  assert.match(tokensCss, /--font-sans\s*:[^;]+"SF Pro Text"/);
  assert.match(tokensCss, /--font-mono\s*:\s*ui-monospace,\s*SFMono-Regular,\s*"SF Mono"/);
  assert.match(tokensCss, /:host\(\[data-font-scale="xl"\]\)/);
  assert.match(tokensCss, /\[data-font-scale\]\s*\{[\s\S]*?--fs-base-sm:/);
  assert.doesNotMatch(tokensCss, /:root,\s*:host\s*\{[^}]*--ui-font-scale\s*:\s*1\s*;/);

  const panelRoot = fileURLToPath(new URL('..', import.meta.url));
  for (const artifact of ['styles.css', 'app.js', 'index.html']) {
    const rawArtifact = fs.readFileSync(join(panelRoot, artifact), 'utf8');
    assert.equal(rawArtifact.includes('\r\n'), false, `${artifact} must normalize line endings to LF`);
  }
});

test('post-compaction context preserves static channels + checkpoint summary, capsule fits 100% without ellipsis, and .step-model-compact follows --accent-primary', async () => {
  const convId = '99999999-8888-4777-8666-555555555555';
  const preStep = {
    type: 'CORTEX_STEP_TYPE_PLANNER_RESPONSE',
    status: 'CORTEX_STEP_STATUS_DONE',
    metadata: {
      createdAt: '2026-11-18T03:00:00Z',
      finishedGeneratingAt: '2026-11-18T03:00:05Z',
      sourceTrajectoryStepInfo: { stepIndex: 10 },
      modelUsage: {
        model: 'MODEL_PLACEHOLDER_M429',
        apiProvider: 'API_PROVIDER_GOOGLE_GEMINI',
        inputTokens: '5400',
        cacheReadTokens: '270000',
        outputTokens: '1200',
      },
    },
  };
  const checkpointStep = {
    type: 'CORTEX_STEP_TYPE_CHECKPOINT',
    status: 'CORTEX_STEP_STATUS_DONE',
    metadata: {
      createdAt: '2026-11-18T03:01:00Z',
      finishedGeneratingAt: '2026-11-18T03:01:06Z',
      sourceTrajectoryStepInfo: { stepIndex: 12 },
      modelUsage: {
        apiProvider: 'API_PROVIDER_GOOGLE_GEMINI',
        inputTokens: '5400',
        cacheReadTokens: '270000',
        outputTokens: '3800',
        thinkingOutputTokens: '800',
        responseOutputTokens: '3000',
      },
    },
  };
  const preGeneratorMetadata = [
    {
      stepIndices: [10],
      chatModel: {
        responseModel: 'gemini-4-carbon-high',
        modelDisplayName: 'Gemini 4 Carbon (High)',
        chatStartMetadata: {
          contextWindowMetadata: {
            estimatedTokensUsed: 275_400,
            maxContextTokens: 384_000,
            tokenBreakdown: {
              groups: [
                {
                  type: 'TOKEN_TYPE_SYSTEM_PROMPT',
                  numTokens: 16_000,
                  children: [
                    { name: 'identity', numTokens: 10_000 },
                    { name: 'skills', numTokens: 4_000 },
                    { name: 'user_rules', numTokens: 2_000 },
                  ],
                },
                {
                  type: 'TOKEN_TYPE_TOOLS',
                  numTokens: 10_000,
                  children: [
                    { name: 'run_command', numTokens: 8_000 },
                    { name: 'mcp_gradio_predict', numTokens: 2_000 },
                  ],
                },
                {
                  type: 'TOKEN_TYPE_CHAT_MESSAGES',
                  numTokens: 249_400,
                  children: [
                    { name: '1: USER_INPUT', numTokens: 49_400 },
                    { name: '2: PLANNER_RESPONSE', numTokens: 80_000 },
                    { name: '3: GENERIC', numTokens: 120_000 },
                  ],
                },
              ],
            },
          },
        },
      },
    },
  ];

  const h = backendHarness({
    clock: () => Date.parse('2026-11-18T03:02:00Z'),
    summaries: {
      [convId]: {
        summary: 'Compaction test',
        stepCount: 2,
        status: 'CASCADE_RUN_STATUS_IDLE',
        lastModifiedTime: '2026-11-18T03:01:06Z',
      },
    },
    trajectories: {
      [convId]: {
        numTotalSteps: 2,
        trajectory: {
          steps: [preStep, checkpointStep],
          generatorMetadata: preGeneratorMetadata,
        },
      },
    },
  });

  const payload = await h.buildTelemetryPayloadInternal(convId);
  const ctx = payload.activeConversation.context;

  // Static channels must survive compaction while old chat history resets and checkpoint summary is recorded
  assert.equal(ctx.systemPromptTokens, 10_000);
  assert.equal(ctx.skillsTokens, 4_000);
  assert.equal(ctx.userRulesTokens, 2_000);
  assert.equal(ctx.systemToolsTokens, 8_000);
  assert.equal(ctx.mcpToolsTokens, 2_000);
  assert.equal(ctx.checkpointTokens, 3_000, 'checkpoint summary uses responseTokens excluding thinkingTokens');
  assert.equal(ctx.userInputTokens, 0);
  assert.equal(ctx.assistantTokens, 0);
  assert.equal(ctx.toolResultsTokens, 0);
  assert.equal(ctx.subagentTokens, 0);
  assert.equal(ctx.totalTokens, 29_000, 'must not leak 275.4k pre-compaction input into post-compaction total');
  assert.equal(ctx.compactionLimitTokens, 384_000, 'inherits 384k custom context budget across compaction step');
  assert.equal(ctx.usedPct, 7.6);
  assert.equal(payload.conversations[0].contextUsedPct, 7.6, 'Multi-Session quick stats must also reflect post-compaction %');

  // Subsequent lightweight step without its own tokenBreakdown rolls forward cleanly on top of compacted baseline
  h.state.summaries[convId].stepCount = 3;
  h.state.summaries[convId].lastModifiedTime = '2026-11-18T03:02:10Z';
  h.state.trajectories[convId] = {
    numTotalSteps: 3,
    trajectory: {
      steps: [
        preStep,
        checkpointStep,
        {
          type: 'CORTEX_STEP_TYPE_PLANNER_RESPONSE',
          status: 'CORTEX_STEP_STATUS_DONE',
          metadata: {
            createdAt: '2026-11-18T03:02:05Z',
            finishedGeneratingAt: '2026-11-18T03:02:10Z',
            sourceTrajectoryStepInfo: { stepIndex: 14 },
            modelUsage: {
              model: 'MODEL_PLACEHOLDER_M429',
              apiProvider: 'API_PROVIDER_GOOGLE_GEMINI',
              inputTokens: '1500',
              cacheReadTokens: '29000',
              outputTokens: '600',
            },
          },
        },
      ],
      generatorMetadata: preGeneratorMetadata,
    },
  };
  const payloadFollowup = await h.buildTelemetryPayloadInternal(convId, true);
  const ctx2 = payloadFollowup.activeConversation.context;
  assert.equal(ctx2.systemPromptTokens, 10_000);
  assert.equal(ctx2.checkpointTokens, 3_000);
  assert.equal(ctx2.userInputTokens, 1_500);
  assert.equal(ctx2.assistantTokens, 600);
  assert.equal(ctx2.totalTokens, 31_100);

  // Verify capsule 100% slot CSS, non-hardcoded compaction suffix color, and narrow-width top pill nav containment
  const stylesCss = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  assert.match(stylesCss, /\.wm-ctx-seg\s*\{[^}]*width:\s*58px;/);
  assert.match(stylesCss, /\.wm-ctx-pct\s*\{[^}]*max-width:\s*none;[^}]*overflow:\s*visible;[^}]*text-overflow:\s*clip;/s);
  assert.match(stylesCss, /\.step-model-compact\s*\{[^}]*color:\s*var\(--accent-primary\);/);
  assert.doesNotMatch(stylesCss, /\.step-model-compact\s*\{[^}]*--metric-info/);
  assert.match(stylesCss, /\.long-pill-nav\s*\{[^}]*container-type:\s*inline-size;[^}]*minmax\(0,\s*1fr\)[^}]*overflow:\s*hidden;/s);
  assert.match(stylesCss, /\.pill-tab\s*\{[^}]*min-width:\s*0;/s);
  assert.match(stylesCss, /@container\s*\(max-width:\s*30em\)\s*\{[\s\S]*?\.pill-tab-badge\s*\{\s*display:\s*none\s*!important;/);
  assert.doesNotMatch(stylesCss, /\.structure-preview-canvas[^{]*\{[^}]*zoom:/, 'Structure preview must stay 1:1 without zoom distortion');
  assert.match(stylesCss, /\.preview-capsule-bar\s*\{[^}]*"Google Sans Flex"/s);
});
