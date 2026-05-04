import { useState } from 'react';
import { solveTest } from './compute/client';
import type { TestSolveResult } from './compute/types';

type Status = 'idle' | 'loading' | 'done' | 'error';

export function App() {
  const [value, setValue] = useState(21);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<TestSolveResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  async function handleTest() {
    setStatus('loading');
    setErrorMessage('');
    setResult(null);
    try {
      const r = await solveTest(value);
      setResult(r);
      setStatus('done');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  }

  return (
    <div className="card">
      <h1>Unum Solum — Motif Designer</h1>
      <p className="subtitle">Jalon 1 · Test de la chaîne Rhino Compute</p>

      <div className="row">
        <label htmlFor="value">Valeur</label>
        <input
          id="value"
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          disabled={status === 'loading'}
        />
        <button onClick={handleTest} disabled={status === 'loading'}>
          {status === 'loading' ? 'Calcul…' : 'Test'}
        </button>
      </div>

      {status === 'done' && result && (
        <div className="result">
          <strong>{result.input}</strong> → <strong>{result.doubled}</strong>
          {result.doubled === result.input * 2 ? ' ✓' : ' (résultat inattendu)'}
        </div>
      )}

      {status === 'error' && (
        <div className="error">{errorMessage}</div>
      )}

      <p className="muted">
        Appelle <code>grasshopper/test1.gh</code> via la Function Netlify{' '}
        <code>/api/solve</code> qui proxy vers Rhino Compute.
      </p>
    </div>
  );
}
