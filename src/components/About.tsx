import { FileText, BookOpen } from 'lucide-react';
import { profileData } from '../data/loadContent';

export default function About() {
  const { bio, bioUnderConstruction, bioNotice, cv } = profileData;
  return (
    <section className="section" id="about">
      <div className="container">
        <p className="eyebrow">About</p>
        <h2>Bio</h2>
        {bioUnderConstruction ? (
          <div className="labcard">
            <p className="eyebrow">Under construction</p>
            <p style={{ color: 'var(--muted)', marginBottom: '1.2rem' }}>{bioNotice}</p>
            <div className="contact-row" style={{ marginTop: 0 }}>
              <a className="chip primary" href={cv}><FileText size={16} /> CV</a>
              <a className="chip" href="/publications.html"><BookOpen size={16} /> Publications</a>
            </div>
          </div>
        ) : (
          <div className="prose">
            {bio.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
