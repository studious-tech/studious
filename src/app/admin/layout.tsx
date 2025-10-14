import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminGuard } from '@/components/admin/admin-guard';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AdminGuard>
  );
}