import type { Metadata } from 'next'
import './globals.css'


export const metadata: Metadata = {
  title: 'Painel de Chamados',
  description: 'Dashboard de chamados do SharePoint',
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
