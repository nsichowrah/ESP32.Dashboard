const SensorCard = ({ title, value, unit }) => {
  const hasValue = value !== null && value !== undefined;

  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-panel backdrop-blur-sm sm:p-5">
      <p className="text-sm font-semibold tracking-wide text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-extrabold text-slate-800 sm:text-4xl">
        {hasValue ? `${Number(value).toFixed(1)} ${unit}` : "--"}
      </p>
    </article>
  );
};

export default SensorCard;
