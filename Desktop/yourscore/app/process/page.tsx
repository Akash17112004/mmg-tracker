import Link from 'next/link';
import MarketingLayout from '@/components/layout/MarketingLayout';
import PageHero from '@/components/ui/PageHero';
import ScrollReveal from '@/components/ui/ScrollReveal';

const steps = [
  ['01', 'Talk to us', 'A no-pressure 30-minute conversation about your goals, target programmes, testing history, and non-negotiables.', 'You leave with a candid view of whether 1:1 coaching is the right fit.'],
  ['02', 'Take a diagnostic', 'A baseline assessment shows how you currently perform across concepts, reasoning, pacing, and endurance.', 'We turn the result into a map of the gaps that are actually holding your score back.'],
  ['03', 'Receive your plan', 'Your mentor sets a practical sequence of learning, drilling, review, and full-length testing around your deadline.', 'You know what to do each week, why it matters, and how progress will be measured.'],
  ['04', 'Prepare with feedback', 'Live 1:1 sessions and targeted work turn the plan into stronger decisions under real test conditions.', 'The plan keeps adapting until your execution matches your target.'],
];

export default function ProcessPage() {
  return <MarketingLayout>
    <PageHero eyebrow="02 / The process" title={<>Simple steps.<br /><em>Serious results.</em></>}>A clear process removes the anxiety of wondering what to do next. From the first call onward, you will always know the next useful move.</PageHero>
    <section className="content-page page-frame"><div className="timeline">{steps.map(([number, title, copy, outcome], index) => <ScrollReveal delay={index * 0.1} key={number}><article><span>{number}</span><div><h2>{title}</h2><p>{copy}</p><aside><b>What changes after this step</b><span>{outcome}</span></aside></div></article></ScrollReveal>)}</div></section>
    <section className="detail-band"><div className="page-frame detail-grid"><div><p className="eyebrow">During preparation</p><h2>Structure that<br /><em>keeps moving.</em></h2></div><ul><li><b>Before every session</b><span>A defined goal and relevant work—not a one-size-fits-all lesson.</span></li><li><b>After every session</b><span>Specific next actions, review notes, and the reasoning to practise.</span></li><li><b>After every mock</b><span>A debrief that separates knowledge gaps from execution errors.</span></li><li><b>At every milestone</b><span>A refreshed strategy based on evidence, not optimism.</span></li></ul></div></section>
    <section className="page-cta page-frame"><p>Your first step is a conversation—not a commitment.</p><Link className="primary-link" href="/contact">Book your free call <span>→</span></Link></section>
  </MarketingLayout>;
}
