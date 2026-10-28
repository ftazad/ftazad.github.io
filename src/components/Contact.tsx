import { Mail, FileText, GraduationCap } from 'lucide-react';
import { profileData } from '../data/loadContent';

export default function Contact() {
  const { email, office, cv, links, contactNote } = profileData;
  return (
    <section className="section" id="contact">
      <div className="container">
        <p className="eyebrow">Contact</p>
        <h2>Get in touch</h2>
        <p className="prose">
          {office}. {contactNote}
        </p>
        <div className="contact-row">
          <a className="chip primary" href={`mailto:${email}`}><Mail size={16} /> {email}</a>
          <a className="chip" href={cv}><FileText size={16} /> Download CV</a>
          <a className="chip" href={links.scholar} target="_blank" rel="noopener noreferrer">
            <GraduationCap size={16} /> Google Scholar
          </a>
        </div>
      </div>
    </section>
  );
}
