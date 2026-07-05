import { Metadata } from 'next';
import { Safety } from '../../src/views/StaticPages';

export const metadata: Metadata = {
  title: 'Safety Tips | OthrHalff',
  description: 'Stay safe on OthrHalff. Tips for meeting people, protecting your information, and reporting concerns.',
<<<<<<< HEAD
=======
  alternates: {
    canonical: '/safety',
  },
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
};

export default function Page() {
  return <Safety />;
}
