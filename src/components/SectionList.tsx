import type { ListItem } from '../data/loadContent';

interface SectionListProps {
  id?: string;
  heading: string;
  items: (string | ListItem)[];
  /** 'bullets' = vertical bulleted list; 'pills' = wrapped pill chips for short lists. */
  variant?: 'bullets' | 'pills';
}

function toItem(i: string | ListItem): ListItem {
  return typeof i === 'string' ? { text: i } : i;
}

export default function SectionList({ id, heading, items, variant = 'bullets' }: SectionListProps) {
  return (
    <section className="section" id={id}>
      <div className="container">
        <h2>{heading}</h2>
        {variant === 'pills' ? (
          <ul className="pillgrid">
            {items.map((raw, idx) => (
              <li key={idx}>{toItem(raw).text}</li>
            ))}
          </ul>
        ) : (
          <ul className="itemlist">
            {items.map((raw, idx) => {
              const item = toItem(raw);
              return (
                <li key={idx} className={item.highlight ? 'highlight' : undefined}>
                  {item.text}
                  {item.url && (
                    <>
                      {' '}
                      <a href={item.url} target="_blank" rel="noopener noreferrer">Read ↗</a>
                    </>
                  )}
                  {item.new && <span className="badge-new">NEW</span>}
                  {item.note && <span className="item-note">{item.note}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
