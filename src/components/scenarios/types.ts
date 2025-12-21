/**
 * Scenario Flowchart Types
 * Data models for building product scenario flowcharts
 */

export type ScenarioStage = 'observation' | 'maturity';
export type OutcomeTone = 'yes' | 'no' | 'neutral';

export interface Outcome {
  title: string;
  lines: string[];
  note?: string;
}

export interface ScenarioNode {
  id: string;
  stage: ScenarioStage;
  condition: string;
  yes: Outcome;
  no: Outcome;
  note?: string;
  metaChips?: string[];
}

export interface ScenarioFlow {
  title: string;
  subtitle?: string;
  nodes: ScenarioNode[];
}








