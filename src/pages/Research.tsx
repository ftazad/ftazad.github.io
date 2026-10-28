import { FileText, GraduationCap, BookOpen } from 'lucide-react';
import Shell from '../shell';
import PageHead from '../components/PageHead';
import { profileData } from '../data/loadContent';

export default function Research() {
  const { researchNotice, cv, links } = profileData;
  return (
    <Shell>
      <PageHead
        title="Research"
        intro="Causally-informed machine learning for forecasting complex dynamic systems under data sparsity and regime shift."
      />
      <section className="section" id="construction">
        <div className="container">
          <div className="labcard">
            <p className="eyebrow">Under construction</p>
            <h2>This page is being updated</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '1.4rem' }}>{researchNotice}</p>
            <div className="contact-row" style={{ marginTop: 0 }}>
              <a className="chip primary" href="/publications.html"><BookOpen size={16} /> Publications</a>
              <a className="chip" href={cv}><FileText size={16} /> CV</a>
              <a className="chip" href={links.scholar} target="_blank" rel="noopener noreferrer">
                <GraduationCap size={16} /> Google Scholar
              </a>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
