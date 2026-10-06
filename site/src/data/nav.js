/* The navigation, in one place.
 *
 * In the original every page carried its own copy of the header and the
 * menu, identical except for aria-current="page" on the item for the
 * page you were on. That is the only difference between all 13 copies,
 * so it is the only thing that needs to be a prop. */

export const NAV = [
  { href: 'somewhere.html', label: 'Somewhere', n: '01', it: 'the trips' },
  { href: 'about.html', label: 'About', n: '02', it: 'the why' },
  { href: 'contact.html', label: 'Contact', n: '03', it: 'the hotline' },
  { href: 'faqs.html', label: 'FAQs', n: '04', it: 'the fine print' },
];

/* The ticker strip. Seven lines, repeated four times in the original so
 * the track is wide enough to scroll seamlessly — the marquee wraps at
 * half the track width, so it needs at least two full passes and the
 * original uses four. */
export const TICKER = [
  'No more ordinary weekends',
  'You will miss your alarm',
  'Say yes, panic later',
  'Someone cries at the station',
  'Sleep is a rumour',
  'Worth it',
  'No itinerary survives contact',
];

export const TICKER_REPEATS = 4;

export const SOCIAL = [
  { href: 'https://www.instagram.com/go.asscheduled/', label: 'Instagram' },
  { href: 'https://snapchat.com/t/cpMiq117', label: 'Snapchat' },
  { href: 'https://www.youtube.com/@Notasscheduled', label: 'YouTube' },
  { href: 'https://wa.me/917853022360', label: 'WhatsApp' },
];
