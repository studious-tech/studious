export default function TestSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="test-session-layout">
      {/* No header/footer for test sessions - full screen experience */}
      {children}
    </div>
  );
}
