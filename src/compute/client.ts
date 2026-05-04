import {
  GrasshopperClient,
  GrasshopperResponseProcessor,
  TreeBuilder,
  type SolveScheduler,
} from '@selvajs/compute/grasshopper';
import type { TestSolveResult } from './types';

const TEST_DEFINITION = 'test1.gh';

let clientPromise: Promise<{
  client: GrasshopperClient;
  scheduler: SolveScheduler;
}> | null = null;

async function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const client = await GrasshopperClient.create({
        serverUrl: '/api/solve',
      });
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

  const io = await client.getIO(TEST_DEFINITION);
  if (io.inputs.length === 0) {
    throw new Error(
      `La définition ${TEST_DEFINITION} n'expose aucun input. Vérifier qu'elle contient un input number.`,
    );
  }

  const inputName = io.inputs[0].name;
  let trees = TreeBuilder.fromInputParams(io.inputs);
  trees = TreeBuilder.replaceTreeValue(trees, inputName, value);

  const response = await scheduler.solve(TEST_DEFINITION, trees);
  const { values } = new GrasshopperResponseProcessor(response).getValues();

  const firstOutputName = Object.keys(values)[0];
  if (!firstOutputName) {
    throw new Error(
      `La définition ${TEST_DEFINITION} n'a renvoyé aucun output.`,
    );
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
