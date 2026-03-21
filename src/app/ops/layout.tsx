import { OpsAuthProvider } from "./OpsAuthProvider";
import { OpsThemeProvider } from "./ThemeProvider";

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OpsAuthProvider>
      <OpsThemeProvider>
        {children}
      </OpsThemeProvider>
    </OpsAuthProvider>
  );
}
