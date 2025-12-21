/**
 * Scenario Flowchart Component
 * Factsheet-style flowchart with rail, condition boxes, and outcome boxes
 */

import { CalendarClock, CalendarCheck2 } from 'lucide-react';
import type { ScenarioFlow, ScenarioNode } from './types';
import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';

interface ScenarioFlowchartProps {
  flow: ScenarioFlow;
}

export function ScenarioFlowchart({ flow }: ScenarioFlowchartProps) {
  // Group nodes by stage
  const observationNodes = flow.nodes.filter(n => n.stage === 'observation');
  const maturityNodes = flow.nodes.filter(n => n.stage === 'maturity');

  return (
    <CardShell className="p-6">
      <SectionHeader title={flow.title} subtitle={flow.subtitle} />
      
      <div className="mt-6">
        {/* Desktop Layout: 3-column grid */}
        <div className="hidden lg:grid lg:grid-cols-[120px_1fr_1fr] gap-6">
          {/* Rail Column */}
          <div className="flex flex-col space-y-12 pt-4">
            {observationNodes.length > 0 && (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center border-2 border-violet-300">
                  <CalendarClock className="w-6 h-6 text-violet-600" />
                </div>
                <div className="text-xs font-semibold text-text-secondary text-center">
                  At each observation
                </div>
              </div>
            )}
            {maturityNodes.length > 0 && (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center border-2 border-violet-300">
                  <CalendarCheck2 className="w-6 h-6 text-violet-600" />
                </div>
                <div className="text-xs font-semibold text-text-secondary text-center">
                  At maturity
                </div>
              </div>
            )}
          </div>

          {/* Condition + Outcomes Column */}
          <div className="col-span-2 space-y-8">
            {/* Observation Nodes */}
            {observationNodes.map((node, idx) => (
              <ScenarioNodeComponent key={node.id} node={node} index={idx} />
            ))}

            {/* Maturity Nodes */}
            {maturityNodes.map((node, idx) => (
              <ScenarioNodeComponent key={node.id} node={node} index={observationNodes.length + idx} />
            ))}
          </div>
        </div>

        {/* Mobile Layout: Stacked */}
        <div className="lg:hidden space-y-8">
          {flow.nodes.map((node) => (
            <div key={node.id} className="space-y-4">
              {/* Stage Label */}
              <div className="flex items-center space-x-2">
                {node.stage === 'observation' ? (
                  <CalendarClock className="w-5 h-5 text-violet-600" />
                ) : (
                  <CalendarCheck2 className="w-5 h-5 text-violet-600" />
                )}
                <span className="text-sm font-semibold text-text-secondary">
                  {node.stage === 'observation' ? 'At each observation' : 'At maturity'}
                </span>
              </div>

              {/* Condition Box */}
              <div className="border-4 border-dotted border-violet-500 bg-violet-50 rounded-xl p-4 text-center">
                <p className="font-semibold text-slate-800">{node.condition}</p>
                {node.note && (
                  <p className="text-xs text-text-secondary mt-2">{node.note}</p>
                )}
              </div>

              {/* Outcomes */}
              <div className="grid grid-cols-1 gap-4">
                <OutcomeBox outcome={node.yes} tone="yes" />
                <OutcomeBox outcome={node.no} tone="no" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

interface ScenarioNodeComponentProps {
  node: ScenarioNode;
  index: number;
}

function ScenarioNodeComponent({ node, index }: ScenarioNodeComponentProps) {
  return (
    <div className="relative">
      {/* Condition Box */}
      <div className="border-4 border-dotted border-violet-500 bg-violet-50 rounded-xl p-4 text-center mb-4">
        <p className="font-semibold text-slate-800 text-base">{node.condition}</p>
        {node.note && (
          <p className="text-xs text-text-secondary mt-2">{node.note}</p>
        )}
        {node.metaChips && node.metaChips.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {node.metaChips.map((chip, i) => (
              <span key={i} className="px-2 py-0.5 bg-white rounded-full text-xs text-text-secondary border border-slate-200">
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Outcomes Row */}
      <div className="grid grid-cols-2 gap-4">
        <OutcomeBox outcome={node.yes} tone="yes" />
        <OutcomeBox outcome={node.no} tone="no" />
      </div>
    </div>
  );
}

interface OutcomeBoxProps {
  outcome: {
    title: string;
    lines: string[];
    note?: string;
  };
  tone: 'yes' | 'no';
}

function OutcomeBox({ outcome, tone }: OutcomeBoxProps) {
  const isYes = tone === 'yes';
  const borderColor = isYes ? 'border-emerald-500' : 'border-orange-500';
  const bgColor = isYes ? 'bg-emerald-50' : 'bg-orange-50';
  const tagBg = isYes ? 'bg-emerald-500' : 'bg-orange-500';
  const tagText = isYes ? 'YES' : 'NO';

  return (
    <div className={`relative rounded-2xl border-4 ${borderColor} ${bgColor} p-4 min-h-[180px]`}>
      {/* Vertical Tag */}
      <div className={`absolute left-0 top-0 bottom-0 w-10 ${tagBg} text-white flex items-center justify-center rounded-l-2xl`}>
        <span
          className="font-bold text-sm"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}
        >
          {tagText}
        </span>
      </div>

      {/* Content */}
      <div className="ml-12">
        <h4 className="font-bold text-lg text-text-primary mb-3">{outcome.title}</h4>
        <ul className="space-y-2">
          {outcome.lines.map((line, index) => (
            <li key={index} className="text-sm text-text-secondary flex items-start">
              <span className="mr-2">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
        {outcome.note && (
          <p className="text-xs text-text-tertiary mt-3 italic">{outcome.note}</p>
        )}
      </div>
    </div>
  );
}








