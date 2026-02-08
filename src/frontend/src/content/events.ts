export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  type: 'meetup' | 'convention' | 'workshop';
  description: string;
}

export const events: Event[] = [
  {
    id: 1,
    title: 'Plushie Collectors Meetup - Spring Edition',
    date: 'March 15, 2026',
    location: 'Portland, OR',
    type: 'meetup',
    description:
      'Join fellow collectors for an afternoon of sharing, trading, and connecting. Bring your favorite plushies and meet local enthusiasts in a relaxed café setting.',
  },
  {
    id: 2,
    title: 'PlushCon 2026',
    date: 'April 20-22, 2026',
    location: 'Chicago, IL',
    type: 'convention',
    description:
      'The premier plushie convention featuring vendors, workshops, guest speakers, and a massive collector showcase. Three days of plushie celebration!',
  },
  {
    id: 3,
    title: 'Plushie Care & Restoration Workshop',
    date: 'May 8, 2026',
    location: 'Seattle, WA',
    type: 'workshop',
    description:
      'Learn professional techniques for cleaning, repairing, and restoring plushies. Hands-on workshop with expert instruction. Bring a plushie that needs TLC!',
  },
  {
    id: 4,
    title: 'Summer Plushie Picnic',
    date: 'June 10, 2026',
    location: 'Austin, TX',
    type: 'meetup',
    description:
      'Outdoor gathering in the park with games, photo opportunities, and community bonding. Family-friendly event welcoming collectors of all ages.',
  },
  {
    id: 5,
    title: 'Vintage Plushie Showcase & Swap',
    date: 'July 14, 2026',
    location: 'Boston, MA',
    type: 'meetup',
    description:
      'Focused on vintage and rare plushies. Bring pieces to show, trade, or sell. Expert appraisers available for collection valuations.',
  },
  {
    id: 6,
    title: 'Cozy Crafts: DIY Plushie Accessories',
    date: 'August 5, 2026',
    location: 'Denver, CO',
    type: 'workshop',
    description:
      'Create custom clothing, accessories, and display items for your plushies. All materials provided. Perfect for beginners and experienced crafters alike.',
  },
  {
    id: 7,
    title: 'PlushieFest Fall Gathering',
    date: 'September 28, 2026',
    location: 'San Francisco, CA',
    type: 'convention',
    description:
      'Two-day festival celebrating plushie culture with vendors, artists, panels, and community events. Special focus on independent creators and small brands.',
  },
];
