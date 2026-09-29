import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import Chatbot from '@/components/Chatbot';
import PageLoadingGate from '@/components/PageLoadingGate';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://www.dashijay.dev'),
  title: {
    default: 'Dashintha Jayawardana | DevOps & Cloud Engineer',
    template: '%s | Dashintha Jayawardana',
  },
  description:
    'Full-stack DevOps & Cloud Engineer specializing in cloud infrastructure, automation, Kubernetes, and reliable CI/CD deployment pipelines.',
  keywords: [
    'Dashintha Jayawardana',
    'Dashintha',
    'dashijay',
    'DevOps Engineer',
    'Cloud Architect',
    'AWS',
    'Kubernetes',
    'Docker',
    'CI/CD Pipelines',
    'Cloud Infrastructure',
    'Portfolio',
  ],
  authors: [{ name: 'Dashintha Jayawardana', url: 'https://www.dashijay.dev' }],
  creator: 'Dashintha Jayawardana',
  publisher: 'Dashintha Jayawardana',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Dashintha Jayawardana | DevOps & Cloud Engineer',
    description:
      'Full-stack DevOps & Cloud Engineer specializing in cloud infrastructure, automation, Kubernetes, and reliable CI/CD deployment pipelines.',
    url: 'https://www.dashijay.dev',
    siteName: 'Dashintha Jayawardana',
    images: [
      {
        url: '/images/profile.png',
        width: 800,
        height: 800,
        alt: 'Dashintha Jayawardana - DevOps & Cloud Engineer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashintha Jayawardana | DevOps & Cloud Engineer',
    description:
      'Full-stack DevOps & Cloud Engineer specializing in cloud infrastructure, automation, Kubernetes, and reliable CI/CD deployment pipelines.',
    images: ['/images/profile.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://www.dashijay.dev/#website',
      url: 'https://www.dashijay.dev',
      name: 'Dashintha Jayawardana',
      alternateName: ['Dashintha', 'dashijay.dev', 'Dashintha Portfolio'],
      description:
        'Personal portfolio and technical showcase of Dashintha Jayawardana, DevOps & Cloud Engineer.',
      publisher: {
        '@id': 'https://www.dashijay.dev/#person',
      },
    },
    {
      '@type': 'Person',
      '@id': 'https://www.dashijay.dev/#person',
      name: 'Dashintha Jayawardana',
      url: 'https://www.dashijay.dev',
      image: 'https://www.dashijay.dev/images/profile.png',
      jobTitle: 'DevOps & Cloud Engineer',
      sameAs: [
        'https://github.com/Dashintha-Prabashwara',
        'https://linkedin.com/in/dashintha-jayawardana',
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}>
        <PageLoadingGate>
          {children}
          <Chatbot />
        </PageLoadingGate>
      </body>
    </html>
  );
}
