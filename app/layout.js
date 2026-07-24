import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';

export const metadata = {
  title: 'Bali Rafting & ATV Quad Bike Tour - Ultimate Ubud Adventure',
  description: 'Book Ayung River Rafting & ATV Quad Biking Combo in Bali',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
