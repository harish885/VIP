import { TechHero } from '@/components/technical/hero';
import { StackLayers } from '@/components/technical/stack-layers';
import { RepoMap } from '@/components/technical/repo-map';
import { IngestPipeline } from '@/components/technical/ingest-pipeline';
import { SchemaGraph } from '@/components/technical/schema-graph';
import { RequestLifecycle } from '@/components/technical/request-lifecycle';
import { SubmissionFlow } from '@/components/technical/submission-flow';
import { ScoringPipelineSection } from '@/components/technical/scoring-pipeline';
import { RecommendationEngineSection } from '@/components/technical/recommendation-engine';
import { SimulationEngineSection } from '@/components/technical/simulation-engine';
import { TypeSystemSection } from '@/components/technical/type-system';
import { WorkedExample } from '@/components/technical/worked-example';
import { TechClosing } from '@/components/technical/closing';

export const metadata = {
  title: 'Technical architecture · VIP',
  description:
    'Deep technical breakdown of the Value Intelligence Platform — stack, database schema, scoring pipeline, simulation engine and end-to-end request flow.',
};

/**
 * /technical — ambitious animated technical infographic.
 *
 * Long-form, scroll-driven explainer of every moving part: Next.js front-end,
 * Supabase Postgres schema with RLS / RPCs / views, the AIDA ingest pipeline,
 * the 6-stage scoring engine, the simulation re-runner, the recommendation /
 * ROV ranker, and the request lifecycle from URL to rendered KPI.
 */
export default function TechnicalPage() {
  return (
    <>
      <TechHero />
      <StackLayers />
      <RepoMap />
      <IngestPipeline />
      <SchemaGraph />
      <RequestLifecycle />
      <SubmissionFlow />
      <ScoringPipelineSection />
      <RecommendationEngineSection />
      <SimulationEngineSection />
      <TypeSystemSection />
      <WorkedExample />
      <TechClosing />
    </>
  );
}
