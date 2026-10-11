import Link from 'next/link';
import MarketingLayout from '@/components/layout/MarketingLayout';
import PageHero from '@/components/ui/PageHero';
import HorizontalScroll from '@/components/ui/HorizontalScroll';
import ScrollReveal from '@/components/ui/ScrollReveal';

const stories = [
  ['GMAT 790', 'Harvard', 'Sushant Sudheendranath', 'Shweta was not just a coach. She was a strategist who knew what I needed to work on before I did.'],
  ['GMAT 770', 'Wharton', 'Sanchit Dayal', 'Verbal stopped feeling like guesswork once it was broken into a framework I could repeat.'],
  ['GMAT 760', 'London Business School', 'Sahebjeet Singh Arora', 'The course had a structure I had not seen elsewhere, with patient attention to every doubt.'],
  ['GMAT 750', 'Columbia University', 'Aniket Saha', 'A 750+ felt impossible at 680. The plan made it feel inevitable, then made it happen.'],
  ['GRE 331', 'ISB', 'Rajat Kadam', 'Within two months I went from feeling lost to genuinely ready for the test.'],
  ['GMAT 740', 'INSEAD', 'Anay Singh', 'It felt like someone was walking the path with me, not simply running preparation classes.'],
];

export default function ResultsPage() {
  return <MarketingLayout>
    <PageHero eyebrow="04 / Student results" title={<>Scores that<br /><em>prove it.</em></>}>The figures matter because they represent more options, stronger applications, and students who showed up ready on test day.</PageHero>
    <ScrollReveal><section className="results-summary page-frame"><div><strong>730</strong><span>Average GMAT score</span></div><div><strong>331</strong><span>Average GRE score</span></div><div><strong>705</strong><span>Average GMAT Focus score</span></div><div><strong>4,000+</strong><span>Success stories</span></div></section></ScrollReveal>
    <section className="results-motion-section"><div className="page-frame results-motion-intro"><ScrollReveal><div><p className="eyebrow">What students say</p><h2>High scores are<br /><em>never an accident.</em></h2></div></ScrollReveal><ScrollReveal delay={0.12}><p>Each story began with a different profile. The common thread is a strategy that made progress visible and test day manageable.</p></ScrollReveal></div><HorizontalScroll>{stories.map(([score, school, name, quote]) => <article className="motion-story-card" key={name} style={{ scrollSnapAlign: 'start' }}><div className="motion-story-top"><strong>{score}</strong><span className="motion-story-school">{school}</span></div><p>“{quote}”</p><footer><b>{name}</b></footer></article>)}</HorizontalScroll></section>
    <ScrollReveal><section className="page-cta page-frame"><p>Let&apos;s build your own score story.</p><Link className="primary-link" href="/contact">Talk to YourScore <span>→</span></Link></section></ScrollReveal>
  </MarketingLayout>;
}
