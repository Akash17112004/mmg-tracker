import MarketingLayout from '@/components/layout/MarketingLayout';
import PageHero from '@/components/ui/PageHero';
import InquiryForm from '@/components/ui/InquiryForm';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function ContactPage() {
  return <MarketingLayout>
    <PageHero eyebrow="05 / Get in touch" title={<>Let&apos;s start<br /><em>your journey.</em></>}>Tell us where you want to go. We will help you decide the most useful next step.</PageHero>
    <section className="contact-page page-frame"><ScrollReveal><div className="contact-sidebar"><p className="eyebrow">Your first call</p><h2>Bring your goals.<br /><em>We&apos;ll bring clarity.</em></h2><p>Our first conversation is a 30-minute consultation about your timeline, your target programmes, and the score you need. There is no pressure and no generic pitch.</p><div><b>Email</b><a href="mailto:shweta@admissionsgateway.com">shweta@admissionsgateway.com</a></div><div><b>Phone / WhatsApp</b><a href="tel:918287066346">+91 82870 66346</a></div></div></ScrollReveal><ScrollReveal delay={0.12}><InquiryForm /></ScrollReveal></section>
    <ScrollReveal><section className="contact-next"><div className="page-frame"><p className="eyebrow">What happens next</p><div><span>01</span><p>We review your message and find a suitable time for a focused first conversation.</p><span>02</span><p>You receive a clear recommendation for the next step—whether that is a diagnostic, a timeline discussion, or a preparation plan.</p></div></div></section></ScrollReveal>
  </MarketingLayout>;
}
