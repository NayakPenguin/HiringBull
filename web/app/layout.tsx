import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import StyledComponentsRegistry from "../src/lib/registry";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "HiringBull - India",
  description: "Apply earlier. Face less competition. Reach real people.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <StyledComponentsRegistry>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {children}
          </div>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
