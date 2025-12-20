import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import MainContainer from "@/components/MainContainer";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/providers/query-provider";

export const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
});

export const metadata: Metadata = {
  title: "FRUT",
  description: "FRUT",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  icons: {
    icon: [
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-64x64.png", sizes: "64x64", type: "image/png" },
    ],
    shortcut: "/icon-32x32.png",
    apple: "/icon-64x64.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendard.className} bg-[#FDFFEF]`}>
        <QueryProvider>
          <AuthProvider>
            <MainContainer>{children}</MainContainer>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
