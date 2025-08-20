
import './globals.css';
import Navbar from '@/components/Navbar';
import { I18nProvider } from '@/lib/i18n';

export const metadata = {
  // Adjusted to reflect the shift from a game-focused platform to an app-focused one
  title: 'AI Mini-App Hub',
  description: '收纳与讨论 AI 驱动的简小应用',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <I18nProvider>
          <Navbar />
          <main className="container py-6">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
