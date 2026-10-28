import Shell from '../shell';
import PageHead from '../components/PageHead';
import { profileData, publicationGroups } from '../data/loadContent';

/** Bold the site owner's name inside an author list. */
function Authors({ authors }: { authors: string }) {
  const me = profileData.name;
  const parts = authors.split(me);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <strong className="me">{me}</strong>}
        </span>
      ))}
    </>
  );
}

export default function Publications() {
  return (
    <Shell>
      <PageHead title="Publications" intro="Peer-reviewed articles, tutorials, workshop papers, and preprints." />
      {publicationGroups.map((g) => (
        <section className="section" key={g.heading}>
          <div className="container">
            <h2>{g.heading}</h2>
            <ol className="pubs">
              {g.items.map((p) => (
                <li key={p.id || p.title}>
                  <span className="pub-id">{p.id}</span>
                  <div>
                    <span className="pub-title">{p.title}</span>
                    <span className="pub-authors"><Authors authors={p.authors.replace(/\.\s*$/, '')} />.</span>{' '}
                    <em>{p.venue}</em>, {p.year}.
                    {p.link && (
                      <>
                        {' '}
                        <a href={p.link} target="_blank" rel="noopener noreferrer">Link ↗</a>
                      </>
                    )}
                    {p.new && <span className="badge-new">NEW</span>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}
      <section className="section">
        <div className="container">
          <p className="prose">
            The full list with citations is on{' '}
            <a href={profileData.links.scholar} target="_blank" rel="noopener noreferrer">Google Scholar ↗</a>.
          </p>
        </div>
      </section>
    </Shell>
  );
}
