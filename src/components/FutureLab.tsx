import { ArrowRight } from 'lucide-react';
import { profileData } from '../data/loadContent';

export default function FutureLab() {
  const { futureLab } = profileData;
  return (
    <section className="section" id="lab">
      <div className="container">
        <div className="labcard">
          <p className="eyebrow">{futureLab.eyebrow}</p>
          <h2>{futureLab.heading}</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1.4rem' }}>{futureLab.text}</p>
          <a className="cta-btn" href={futureLab.ctaUrl}>
            {futureLab.ctaLabel} <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
