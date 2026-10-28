import { profileData } from '../data/loadContent';

export default function Footer() {
  const year = 2026;
  const host = profileData.siteUrl.replace(/^https?:\/\//, '');
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {year} {profileData.name}</span>
        <span>
          <a href={profileData.siteUrl}>{host}</a>
          {' · '}
          <a href={`mailto:${profileData.email}`}>{profileData.email}</a>
        </span>
      </div>
    </footer>
  );
}
