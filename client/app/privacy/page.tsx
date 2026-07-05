import { Metadata } from 'next';
import { Privacy } from '../../src/views/StaticPages';

export const metadata: Metadata = {
  title: 'Privacy Policy | OthrHalff',
  description: 'How OthrHalff handles your data. We verify student status but keep you anonymous. We never sell your data.',
<<<<<<< HEAD
=======
  alternates: {
    canonical: '/privacy',
  },
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
};

export default function Page() {
  return <Privacy />;
}
