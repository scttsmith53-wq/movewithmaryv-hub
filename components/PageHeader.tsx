export default function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-8 max-w-6xl">
      {eyebrow && <p className="kicker mb-3">{eyebrow}</p>}
      <h1 className="max-w-5xl text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
      {children && <div className="mt-4 max-w-3xl text-lg leading-8 text-ice/72">{children}</div>}
    </header>
  );
}
