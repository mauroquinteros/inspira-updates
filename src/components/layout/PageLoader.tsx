import { Loader } from "@/components/ui/loader";

interface PageLoaderProps {
  label?: string;
}

export default function PageLoader({ label = "Cargando…" }: PageLoaderProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-slate-400">
      <Loader />
      <p className="text-sm">{label}</p>
    </div>
  );
}
