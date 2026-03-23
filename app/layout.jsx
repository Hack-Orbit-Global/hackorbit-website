import './globals.css'

export const metadata = {
  metadataBase: new URL('https://hackorbit.dev'),
  title: {
    default: 'Hack Orbit — Build in Public. Build Together.',
    template: '%s | Hack Orbit',
  },
  description:
    'Hack Orbit is an open-source developer community where builders collaborate on real projects, participate in hackathons, and grow together in public.',
  keywords: [
    'open source',
    'developer community',
    'hackathon',
    'build in public',
    'contribute',
    'projects',
    'Hack Orbit',
  ],
  authors: [{ name: 'Hack Orbit' }],
  creator: 'Hack Orbit',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hackorbit.dev',
    siteName: 'Hack Orbit',
    title: 'Hack Orbit — Build in Public. Build Together.',
    description:
      'An open-source developer community for builders who collaborate, hackathon, and grow in public.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Hack Orbit — Build in Public. Build Together.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hack Orbit — Build in Public. Build Together.',
    description:
      'An open-source developer community for builders who collaborate, hackathon, and grow in public.',
    images: ['/og-image.png'],
    creator: '@hackorbit',
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
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hack Orbit',
  url: 'https://hackorbit.dev',
  logo: 'https://hackorbit.dev/logo.png',
  sameAs: [
    'https://github.com/Hack-Orbit-Global',
    'https://discord.gg/GVNnacYENf',
    'https://www.linkedin.com/company/hackorbit/',
    'https://www.instagram.com/hackorbit_global/',
  ],
  description:
    'Hack Orbit is an open-source developer community — build projects, contribute to open source, and grow together in public.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
