type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}
