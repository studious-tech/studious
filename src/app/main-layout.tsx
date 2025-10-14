import EnhancedHeaderDynamic from '@/components/common/layout/enhanced-header-dynamic';
import Footer from '@/components/common/layout/footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EnhancedHeaderDynamic />
      {children}
      <Footer />
    </>
  );
}
