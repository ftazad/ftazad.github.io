import Shell from '../shell';
import PageHead from '../components/PageHead';
import SectionList from '../components/SectionList';
import {
  teachingData,
  serviceData,
  talksData,
  membershipData,
  pressData,
} from '../data/loadContent';

export default function Teaching() {
  return (
    <Shell>
      <PageHead
        title="Teaching & Leadership"
        intro="Teaching across graduate and undergraduate computing, five-plus years as university faculty, and service to the research community."
      />
      <SectionList id="teaching" heading={teachingData.heading} items={teachingData.items} />
      <SectionList id="service" heading={serviceData.heading} items={serviceData.items} />
      <SectionList id="talks" heading={talksData.heading} items={talksData.items} />
      <SectionList
        id="membership"
        heading={membershipData.heading}
        items={membershipData.items}
        variant="pills"
      />
      <SectionList id="press" heading={pressData.heading} items={pressData.items} />
    </Shell>
  );
}
