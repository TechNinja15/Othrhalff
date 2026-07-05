import { Metadata } from 'next';
import { About } from '../../src/views/StaticPages';

export const metadata: Metadata = {
  title: 'About OthrHalff',
  description: 'Learn about our mission to bring connection back to campus life without the pressure of superficial swiping.',
<<<<<<< HEAD
=======
  alternates: {
    canonical: '/about',
  },
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
};

export default function Page() {
  return <About />;
}
