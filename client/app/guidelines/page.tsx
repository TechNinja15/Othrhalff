import { Metadata } from 'next';
import { Guidelines } from '../../src/views/StaticPages';

export const metadata: Metadata = {
  title: 'Community Guidelines | OthrHalff',
  description: 'Our rules for keeping OthrHalff a safe, fun, and inclusive space for all university students.',
<<<<<<< HEAD
=======
  alternates: {
    canonical: '/guidelines',
  },
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
};

export default function Page() {
  return <Guidelines />;
}
