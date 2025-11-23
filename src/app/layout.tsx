import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import MainContainer from "@/components/MainContainer";
import { AuthProvider } from "@/contexts/AuthContext";

export const pretendard = localFont({
	src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
	display: "swap",
	weight: "45 920",
});

export const metadata: Metadata = {
	title: "FRUT",
	description: "FRUT",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ko">
			<body className={`${pretendard.className} bg-[#FDFFEF]`}>
				<AuthProvider>
					<MainContainer>{children}</MainContainer>
				</AuthProvider>
			</body>
		</html>
	);
}
