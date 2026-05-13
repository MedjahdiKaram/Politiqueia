export default function ChargementDashboard() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] gap-4">
      {/* Spinner principal */}
      <span className="relative inline-flex h-12 w-12">
        {/* Anneau de fond */}
        <span className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
        {/* Arc rotatif */}
        <span
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 animate-spin"
          style={{ animationDuration: '0.7s' }}
        />
        {/* Point central pulsé */}
        <span className="absolute inset-[14px] rounded-full bg-blue-600 animate-ping opacity-50" />
        <span className="absolute inset-[14px] rounded-full bg-blue-600 opacity-80" />
      </span>

      {/* Texte animé */}
      <p className="text-sm font-medium text-slate-400 animate-pulse">
        Chargement…
      </p>
    </div>
  )
}
