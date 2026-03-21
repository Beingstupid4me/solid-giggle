export default function PatientModuleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background-light text-text-main">
      <div className="mx-auto w-full max-w-md bg-background-light">{children}</div>
    </div>
  );
}
