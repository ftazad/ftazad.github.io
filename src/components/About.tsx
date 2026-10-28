import { profileData } from '../data/loadContent';

export default function About() {
  const { bio } = profileData;
  return (
    <section className="section" id="about">
      <div className="container">
        <p className="eyebrow">About</p>
        <h2>Bio</h2>
        <div className="prose">
          {bio.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
