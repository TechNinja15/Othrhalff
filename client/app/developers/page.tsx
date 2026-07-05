import { Metadata } from 'next';
import { Developers } from '../../src/views/Developers';

export const metadata: Metadata = {
  title: 'The Core Team | OthrHalff',
  description: 'Meet the team behind OthrHalff — passionate students building the future of campus connection.',
<<<<<<< HEAD
=======
  alternates: {
    canonical: '/developers',
  },
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
};

export default function Page() {
  return <Developers />;
}
