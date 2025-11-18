export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">{children}</div>
  );
}
