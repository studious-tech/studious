export default function IELTSAcademicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main>{children}</main>
    </div>
  );
}
