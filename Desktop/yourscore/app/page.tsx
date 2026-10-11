'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import MarketingLayout from '@/components/layout/MarketingLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';

const SIGNUP_URL = 'https://yourscore.learnyst.com/sign-up';

const destinations = [
  {
    number: '01',
    name: 'Our approach',
    copy: 'A rigorous diagnosis, a personal strategy, and one mentor who stays involved.',
    href: '/approach',
  },
  {
    number: '02',
    name: 'The process',
    copy: 'A clear four-step route from first conversation to confident test day.',
    href: '/process',
  },
  {
    number: '03',
    name: 'Meet your mentor',
    copy: '21 years of experience turned into practical, individual guidance.',
    href: '/mentor',
  },
  {
    number: '04',
    name: 'Student results',
    copy: 'See the scores, the schools, and the stories behind them.',
    href: '/results',
  },
];

const approachCards = [
  {
    number: '01',
    title: 'Diagnosis before direction',
    description: 'We study your score report, habits, timing, and reasoning patterns to identify what is actually holding your score back.',
  },
  {
    number: '02',
    title: 'Personalized plan',
    description: 'Your timeline, workload, academic profile, and target schools shape a realistic, score-focused prep plan.',
  },
  {
    number: '03',
    title: 'Dedicated mentor',
    description: 'You work with the same mentor throughout, so feedback stays aligned with your strengths, gaps, and goals.',
  },
  {
    number: '04',
    title: 'Results that last',
    description: 'We build smarter test-taking habits, sharper strategy, and more confidence before test day.',
  },
];

const processSteps = [
  {
    number: '01',
    title: 'Talk to us',
    description: 'We understand your timeline, target scores, and the programmes or schools that matter most.',
  },
  {
    number: '02',
    title: 'Diagnostic test',
    description: 'A baseline evaluation shows how you perform under real conditions across timing, reasoning, and endurance.',
  },
  {
    number: '03',
    title: 'Get your plan',
    description: 'Your mentor maps the exact sequence of practice, review, and testing needed for your goals.',
  },
  {
    number: '04',
    title: 'Start prepping',
    description: 'The plan becomes action, feedback, and accountability each week as you build toward test day.',
  },
];

const teamMembers = [
  {
    name: 'Shweta Gurnani Singh',
    role: 'Chief Academic Mentor',
    bio: 'Guides students with diagnostic precision, strategic focus, and a clear framework for sustainable score improvement.',
    initials: 'SG',
  },
  {
    name: 'Team Member 2',
    role: 'Academic Strategist',
    bio: 'Placeholder bio. Add this team member’s expertise, coaching approach, and the value they bring to students.',
    initials: 'T2',
  },
  {
    name: 'Team Member 3',
    role: 'Student Success Lead',
    bio: 'Placeholder bio. Describe how this team member supports students and keeps preparation moving forward.',
    initials: 'T3',
  },
  {
    name: 'Team Member 4',
    role: 'Mentor / Coach',
    bio: 'Placeholder bio. Replace this card with a real team member’s name, role, and short introduction.',
    initials: 'T4',
  },
];

const testimonialStories = [
  { score: 'GMAT 790', school: 'Harvard', quote: 'The plan did not just raise my score; it gave me clarity on where to focus and how to stay calm under pressure.', name: 'Sushant Sudheendranath' },
  { score: 'GMAT 770', school: 'Wharton', quote: 'Every session had a purpose. I could see the strategy shift from vague effort to tactical progress.', name: 'Sanchit Dayal' },
  { score: 'GRE 331', school: 'ISB', quote: 'The structured approach made the test feel manageable and the score gains feel real, not accidental.', name: 'Rajat Kadam' },
  { score: 'GMAT 760', school: 'Columbia University', quote: 'I finally understood the gaps that were actually limiting my performance across verbal and quant.', name: 'Aniket Saha' },
];

export default function Home() {
  const [showSite, setShowSite] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSite(true), 550);

    return () => window.clearTimeout(timer);
  }, []);

  if (!showSite) {
    return (
      <div className="site-loader">
        <span>YOUR</span>
        <strong>SCORE</strong>
        <i />
      </div>
    );
  }

  return (
    <MarketingLayout>
      <section className="hero-section">
        <div className="page-frame hero-content">
          <p className="eyebrow">GMAT · GRE · EA · SAT</p>

          <p className="home-kicker">
            Strategic 1:1 coaching for ambitious applicants
          </p>

          <h1 className="hero-heading">
            Your exam.
            <span>Your score.</span>
          </h1>

          <p className="hero-subtext">
            Get a preparation plan built around your score gap, your schedule, and the schools that matter to you.
          </p>

          <div className="hero-cta-row">
            <a className="primary-link hero-signup" href={SIGNUP_URL} target="_blank" rel="noreferrer">
              Sign Up <span>→</span>
            </a>
            <Link className="secondary-link" href="/contact">
              Talk to an advisor
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <strong>730</strong>
              <span>Average GMAT</span>
            </div>

            <div>
              <strong>331</strong>
              <span>Average GRE</span>
            </div>

            <div>
              <strong>4,000+</strong>
              <span>Students guided</span>
            </div>

            <div>
              <strong>21</strong>
              <span>Years mentoring</span>
            </div>
          </div>
        </div>
      </section>

      <ScrollReveal>
        <section className="home-intro page-frame">
          <p className="eyebrow">The YourScore difference</p>

          <div>
            <h2>
              Preparation with
              <br />
              <em>a point of view.</em>
            </h2>

            <p>
              Great scores are rarely the product of more material. They come from an honest starting point, a focused plan, and feedback that arrives at the right moment.
            </p>
          </div>
        </section>
      </ScrollReveal>

      <section id="approach-process" className="approach-process-section page-frame">
        <div className="section-heading">
          <p className="eyebrow">How we work</p>
          <h2>
            Clear strategy,<br />
            <em>measurable progress.</em>
          </h2>
        </div>

        <div className="approach-process-grid">
          <div className="info-panel">
            <div className="panel-header">
              <h3>Our Approach</h3>
            </div>
            <div className="card-stack">
              {approachCards.map((item) => (
                <article className="info-card" key={item.number}>
                  <span>{item.number}</span>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="info-panel">
            <div className="panel-header">
              <h3>Our Process</h3>
            </div>
            <div className="card-stack">
              {processSteps.map((item) => (
                <article className="info-card" key={item.number}>
                  <span>{item.number}</span>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="our-team" className="team-section page-frame">
        <div className="section-heading center-heading">
          <p className="eyebrow">Our team</p>
          <h2>
            Mentors who bring<br />
            <em>clarity to the process.</em>
          </h2>
        </div>

        <div className="team-grid">
          {teamMembers.map((member) => (
            <article className="team-card" key={member.name}>
              <div className="team-photo" aria-label={member.name}>
                {member.initials}
              </div>
              <h3>{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-bio">{member.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="results-section page-frame">
        <div className="section-heading results-heading">
          <p className="eyebrow">Student results</p>
          <h2>
            Scores that reflect<br />
            <em>real momentum.</em>
          </h2>
        </div>

        <div className="testimonial-grid">
          {testimonialStories.map((story) => (
            <article key={story.school} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-score">{story.score}</div>
                <div className="testimonial-school">{story.school}</div>
              </div>
              <p className="testimonial-quote">“{story.quote}”</p>
              <footer>{story.name}</footer>
            </article>
          ))}
        </div>
      </section>

      <section className="destination-section page-frame">
        {destinations.map((item, index) => (
          <ScrollReveal delay={index * 0.08} key={item.href}>
            <Link className="destination-card" href={item.href}>
              <span>{item.number}</span>

              <div>
                <h3>{item.name}</h3>
                <p>{item.copy}</p>
              </div>

              <b>→</b>
            </Link>
          </ScrollReveal>
        ))}
      </section>
    </MarketingLayout>
  );
}
