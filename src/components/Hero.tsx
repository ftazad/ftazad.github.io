import { useState } from 'react';
import { GraduationCap, FileText, Github, Linkedin, Mail, BookOpen } from 'lucide-react';
import { profileData } from '../data/loadContent';

export default function Hero() {
  const { name, credential, roles, headshot, initials, cv, email, links, jobMarket, stats } = profileData;
  const [photoOk, setPhotoOk] = useState(true);
  return (
    <header className="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-lead">
            <h1 className="hero-name">{name}</h1>
            <hr className="hero-rule" />

            <div className="roles">
              {credential && <p className="credential">{credential}</p>}
              {roles.map((r) => (
                <p className="role" key={r.role}>
                  <span className="role-title">{r.role}</span>
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer">{r.org}</a>
                  ) : (
                    <span className="role-org">{r.org}</span>
                  )}
                </p>
              ))}
              <p className="role role-contact">
                <Mail size={15} /> <a href={`mailto:${email}`}>{email}</a>
              </p>
            </div>

            <div className="quicklinks">
              <a className="chip primary" href={cv}><FileText size={16} /> CV</a>
              <a className="chip" href={links.scholar} target="_blank" rel="noopener noreferrer">
                <GraduationCap size={16} /> Scholar
              </a>
              {links.researchgate && (
                <a className="chip" href={links.researchgate} target="_blank" rel="noopener noreferrer">
                  <BookOpen size={16} /> ResearchGate
                </a>
              )}
              {links.dblp && (
                <a className="chip" href={links.dblp} target="_blank" rel="noopener noreferrer">DBLP</a>
              )}
              {links.orcid && (
                <a className="chip" href={links.orcid} target="_blank" rel="noopener noreferrer">ORCID</a>
              )}
              <a className="chip" href={links.github} target="_blank" rel="noopener noreferrer">
                <Github size={16} /> GitHub
              </a>
              <a className="chip" href={links.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin size={16} /> LinkedIn
              </a>
            </div>
          </div>

          <div className="hero-cards">
            {photoOk ? (
              <img
                className="headshot"
                src={headshot}
                alt={`Portrait of ${name}`}
                onError={() => setPhotoOk(false)}
              />
            ) : (
              <div className="headshot headshot-fallback" aria-hidden="true">{initials}</div>
            )}
            <a className="market-card" href={jobMarket.url}>
              <strong>{jobMarket.title}</strong>
              <span>{jobMarket.text}</span>
            </a>
          </div>
        </div>

        <div className="stats">
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <div className="val">{s.value}</div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
