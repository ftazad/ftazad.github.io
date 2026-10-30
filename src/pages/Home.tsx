import Shell from '../shell';
import Hero from '../components/Hero';
import About from '../components/About';
import SectionList from '../components/SectionList';
import Contact from '../components/Contact';
import { educationData, awardsData, fundingData } from '../data/loadContent';

export default function Home() {
  return (
    <Shell>
      <Hero />
      <About />
      <SectionList id="education" heading={educationData.heading} items={educationData.items} />
      <SectionList id="awards" heading={awardsData.heading} items={awardsData.items} />
      <SectionList id="funding" heading={fundingData.heading} items={fundingData.items} />
      <Contact />
    </Shell>
  );
}
