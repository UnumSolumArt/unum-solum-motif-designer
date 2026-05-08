import {
  GrasshopperClient,
  GrasshopperResponseProcessor,
  TreeBuilder,
  type SolveScheduler,
} from '@selvajs/compute/grasshopper';
import type { TestSolveResult } from './types';

const TEST_DEFINITION_URL = '/grasshopper/test1.gh';

let clientPromise: Promise<{
  client: GrasshopperClient;
  scheduler: SolveScheduler;
}> | null = null;

let definitionPromise: Promise<Uint8Array> | null = null;

async function loadDefinition(): Promise<Uint8Array> {
  if (!definitionPromise) {
    definitionPromise = (async () => {
      const res = await fetch(TEST_DEFINITION_URL);
      if (!res.ok) {
        throw new Error(
          `Impossible de charger ${TEST_DEFINITION_URL} (HTTP ${res.status}).`,
        );
      }
      return new Uint8Array(await res.arrayBuffer());
    })();
  }
  return definitionPromise;
}

function resolveServerUrl(): string {
  const override = import.meta.env.VITE_API_BASE;
  if (typeof override === 'string' && override.trim()) {
    return override.replace(/\/+$/, '') + '/api/solve';
  }
  const origin =
    typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
      ? window.location.origin
      : 'http://localhost:8888';
  return `${origin}/api/solve`;
}

async function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const serverUrl = resolveServerUrl();
      // eslint-disable-next-line no-console
      console.info('[unum-solum] Rhino Compute proxy URL:', serverUrl);
      const client = await GrasshopperClient.create({ serverUrl });
      const scheduler = client.createScheduler({
        mode: 'latest-wins',
        timeoutMs: 30_000,
      });
      return { client, scheduler };
    })();
  }
  return clientPromise;
}

/**
 * Jalon 1 — appelle la définition GH minimale `test1.gh` qui double son input.
 * Sert à valider la chaîne navigateur → /api/solve → Rhino Compute.
 */
export async function solveTest(value: number): Promise<TestSolveResult> {
  const { client, scheduler } = await getClient();
  const definition = await loadDefinition();

  const io = await client.getIO(definition);
  // eslint-disable-next-line no-console
  console.info(
    '[unum-solum] test1.gh inputs:',
    io.inputs.map((i) => ({
      name: i.name,
      nickname: i.nickname,
      paramType: i.paramType,
    })),
  );
  // eslint-disable-next-line no-console
  console.info(
    '[unum-solum] test1.gh outputs:',
    io.outputs.map((o) => ({ name: o.name, nickname: o.nickname })),
  );
  if (io.inputs.length === 0) {
    throw new Error(
      `La définition test1.gh n'expose aucun input. Vérifier qu'elle contient un input number.`,
    );
  }

  const inputName = io.inputs[0].nickname || io.inputs[0].name;
  let trees = TreeBuilder.fromInputParams(io.inputs);
  trees = TreeBuilder.replaceTreeValue(trees, inputName, value);

  const response = await scheduler.solve(definition, trees);
  const { values } = new GrasshopperResponseProcessor(response).getValues();
  // eslint-disable-next-line no-console
  console.info('[unum-solum] raw output values:', values);

  const firstOutputName = Object.keys(values)[0];
  if (!firstOutputName) {
    throw new Error(`La définition test1.gh n'a renvoyé aucun output.`);
  }
  const raw = values[firstOutputName];
  const doubled = extractFirstNumber(raw);
  if (doubled === null) {
    throw new Error(
      `Output "${firstOutputName}" n'est pas un nombre interprétable : ${JSON.stringify(raw)}`,
    );
  }

  return { input: value, doubled };
}

function extractFirstNumber(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const n = extractFirstNumber(item);
      if (n !== null) return n;
    }
  }
  if (raw && typeof raw === 'object') {
    for (const item of Object.values(raw as Record<string, unknown>)) {
      const n = extractFirstNumber(item);
      if (n !== null) return n;
    }
  }
  return null;
}
