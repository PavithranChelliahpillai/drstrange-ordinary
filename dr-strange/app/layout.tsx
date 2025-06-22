import './globals.css'

export const metadata = {
  title: 'Dr. Strange - AI Drug Interaction Predictor',
  description: 'Advanced AI-powered drug interaction prediction platform for healthcare professionals',
  keywords: ['drug interactions', 'AI', 'healthcare', 'medicine', 'prediction', 'pharmacy'],
  authors: [{ name: 'Hackathon Team' }],
  openGraph: {
    title: 'Dr. Strange - AI Drug Interaction Predictor',
    description: 'Advanced AI-powered drug interaction prediction platform for healthcare professionals',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50">
          {children}
        </div>
      </body>
    </html>
  )
} 