import { Metadata } from 'next';
import { Landing } from '../src/views/Landing';

export const metadata: Metadata = {
  title: 'OthrHalff - Where anonymous meets destiny.',
  description: 'The anonymous dating app built for university students. Discover connections without superficial swiping.',
<<<<<<< HEAD
=======
  alternates: {
    canonical: '/',
  },
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
  openGraph: {
    title: 'OthrHalff - Where anonymous meets destiny',
    description: 'The anonymous dating app built for university students.',
    images: ['/blog/home-screen.png'],
  }
};

export default function Page() {
  return <Landing />;
}
