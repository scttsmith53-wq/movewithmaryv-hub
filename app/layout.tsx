import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import AuthSync from '@/components/AuthSync';
import PhoneGate from '@/components/PhoneGate';

export const metadata: Metadata = {
  title: 'Move With Mary V — Homeowner Hub',
  description: 'Your co-branded homeowner hub — home value, sale proceeds, and next-move planning with Mary Vega (Keller Williams) and Scott Smith (Citywide Home Mortgage).'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-6FYJ9YLVZD" strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-6FYJ9YLVZD');`}
        </Script>
        {/* Meta Pixel */}
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','879134155809312');fbq('track','PageView');`}
        </Script>
      </head>
      <body>
        <AuthSync />
        <PhoneGate />
        {children}
      </body>
    </html>
  );
}
