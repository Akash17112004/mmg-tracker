import Link from 'next/link';
import MarketingLayout from '@/components/layout/MarketingLayout';
import PageHero from '@/components/ui/PageHero';
import ScrollReveal from '@/components/ui/ScrollReveal';

const principles = [
  ['01', 'Diagnosis before direction', 'We study your score report, habits, timing, and the exact moments where your reasoning breaks down. A number is useful; the pattern behind it creates a plan.'],
  ['02', 'A plan that fits real life', 'Your timeline, work schedule, academic background, and target score shape the sequence. The plan is ambitious, but it is designed to be sustained.'],
  ['03', 'One accountable mentor', 'You work with the same mentor throughout. That continuity makes feedback sharper as you progress instead of resetting every session.'],
  ['04', 'Practice with a purpose', 'Every set has a reason: build a skill, test a decision, or pressure-test a strategy. We never use volume as a substitute for insight.'],
];

export default function ApproachPage() {
  return <MarketingLayout>
    <PageHero eyebrow="01 / Our approach" title={<>Not a coaching class.<br /><em>A commitment.</em></>}>YourScore is personal, score-focused preparation for applicants who want clarity—not a library of generic lessons.</PageHero>
    <section className="content-page page-frame"><ScrollReveal><div className="content-intro"><p className="eyebrow">How we think</p><h2>Better decisions create<br /><em>better scores.</em></h2><p>The work begins well before a study calendar. We identify your decision-making habits, then build the knowledge, timing, and confidence required to change them.</p></div></ScrollReveal><div className="principle-list">{principles.map(([number, title, copy], index) => <ScrollReveal delay={index * 0.09} key={number}><article><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article></ScrollReveal>)}</div></section>
    <ScrollReveal><section className="detail-band"><div className="page-frame detail-grid"><div><p className="eyebrow">What your plan includes</p><h2>A complete system,<br /><em>not a loose syllabus.</em></h2></div><ul><li><b>Baseline analysis</b><span>Topic-level review, timing patterns, and score-gap priorities.</span></li><li><b>Weekly strategy</b><span>Clear session goals, practice selections, and measurable checkpoints.</span></li><li><b>Mock-test debriefs</b><span>Detailed analysis of decisions, pacing, and next actions.</span></li><li><b>Application-aware guidance</b><span>Preparation that respects your school list and test deadline.</span></li></ul></div></section></ScrollReveal>
    <ScrollReveal><section className="page-cta page-frame"><p>Ready to see what a plan built for you looks like?</p><Link className="primary-link" href="/contact">Start with a free call <span>→</span></Link></section></ScrollReveal>
  </MarketingLayout>;
}
