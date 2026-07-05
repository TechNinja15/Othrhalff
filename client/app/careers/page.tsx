import { Metadata } from 'next';
import { Careers } from '../../src/views/Careers';

export const metadata: Metadata = {
  title: 'Careers | OthrHalff',
  description: 'Join the Ghost Crew. We are a small, passionate team building the next generation of social discovery.',
<<<<<<< HEAD
=======
  alternates: {
    canonical: '/careers',
  },
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
};

export default function Page() {
  return <Careers />;
}
