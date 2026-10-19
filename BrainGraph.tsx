import React from 'react';
import {getBrainLayout, NUM_HIDDEN, OUTPUT_LABELS, OUTPUTS_PER_JOINT, type Organism} from './simulation';

export default function BrainGraph({organism: org, threshold}: {organism: Organism; threshold: number}) {
  const g = org.genome, layout = getBrainLayout(g);
  const height = Math.max(300, org.neuralInputs.length * 12 + 20);
  const x = [105, 250, 400];
  const positions = (n: number) => Array.from({length: n}, (_, i) => 12 + i * (height - 24) / Math.max(1, n - 1));
  const inputs = positions(org.neuralInputs.length), hidden = positions(NUM_HIDDEN), outputs = positions(layout.outputs.length);
  const links: React.ReactNode[] = [];
  const link = (key: string, fromX: number, fromY: number, toX: number, toY: number, weight: number, activation: number, recurrent = false) => {
    if (Math.abs(weight) <= threshold) return;
    const color = weight > 0 ? '6,182,212' : '244,63,94';
    const opacity = Math.min(recurrent ? .35 : .85, .08 + Math.abs(weight * activation) * .7);
    links.push(<path key={key} data-synapse={key} d={recurrent
      ? `M${fromX},${fromY} C${fromX + 52},${fromY - 10} ${toX + 52},${toY + 10} ${toX},${toY}`
      : `M${fromX},${fromY} L${toX},${toY}`}
      fill="none" stroke={`rgba(${color},${opacity})`} strokeWidth={Math.min(2, .4 + Math.abs(weight) * .5)}>
      <title>{key}: weight {weight.toFixed(4)}, source activation {activation.toFixed(4)}</title>
    </path>);
  };
  for (let h = 0; h < NUM_HIDDEN; h++) {
    for (let i = 0; i < inputs.length; i++) link(`input ${i + 1} → hidden ${h + 1}`, x[0], inputs[i], x[1], hidden[h], g.weightsIH[h]?.[i] ?? 0, org.neuralInputs[i] ?? 0);
    for (let prev = 0; prev < NUM_HIDDEN; prev++) link(`hidden ${prev + 1} → hidden ${h + 1}`, x[1], hidden[prev], x[1], hidden[h], g.weightsHH[h]?.[prev] ?? 0, org.neuralHidden[prev] ?? 0, true);
  }
  for (let o = 0; o < outputs.length; o++) for (let h = 0; h < NUM_HIDDEN; h++) link(`hidden ${h + 1} → output ${o + 1}`, x[1], hidden[h], x[2], outputs[o], g.weightsHO[o]?.[h] ?? 0, org.neuralHidden[h] ?? 0);
  return <div className="w-full max-h-72 overflow-y-auto">
    <svg viewBox={`0 0 460 ${height}`} className="w-full select-none" style={{height}} role="img" aria-label="Live recurrent neural network">
      {links}
      {inputs.map((y, i) => <g key={layout.inputs[i]}>
        <circle cx={x[0]} cy={y} r={3} fill={`rgba(6,182,212,${.25 + Math.min(1, Math.abs(org.neuralInputs[i] ?? 0)) * .75})`}>
          <title>{layout.labels[i]}: {(org.neuralInputs[i] ?? 0).toFixed(4)}</title>
        </circle>
        <text x={x[0] - 6} y={y + 2.5} fontSize="7" textAnchor="end" fill="#94a3b8" fontFamily="monospace">{layout.labels[i]}</text>
      </g>)}
      {hidden.map((y, i) => <circle key={i} cx={x[1]} cy={y} r={4}
        fill={`rgba(${(org.neuralHidden[i] ?? 0) >= 0 ? '168,85,247' : '244,63,94'},${.3 + Math.abs(org.neuralHidden[i] ?? 0) * .7})`}>
        <title>Hidden {i + 1}: {(org.neuralHidden[i] ?? 0).toFixed(4)}</title>
      </circle>)}
      {outputs.map((y, i) => <g key={layout.outputs[i]}>
        <circle cx={x[2]} cy={y} r={3.2} fill="#f59e0b">
          <title>Output {i + 1}: {(org.neuralOutputs[i] ?? 0).toFixed(4)}</title>
        </circle>
        <text x={x[2] + 6} y={y + 2.5} fontSize="7" fill="#fde68a" fontFamily="monospace">
          J{Math.floor(i / OUTPUTS_PER_JOINT) + 1}:{OUTPUT_LABELS[i % OUTPUTS_PER_JOINT]}
        </text>
      </g>)}
    </svg>
  </div>;
}
