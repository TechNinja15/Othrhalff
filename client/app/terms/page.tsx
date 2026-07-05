import { Metadata } from 'next';
import { Terms } from '../../src/views/StaticPages';

export const metadata: Metadata = {
  title: 'Terms of Service | OthrHalff',
  description: 'Terms of Service for OthrHalff. By using this platform, you agree to our terms and conditions.',
<<<<<<< HEAD
=======
  alternates: {
    canonical: '/terms',
  },
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
};

export default function Page() {
  return <Terms />;
}
