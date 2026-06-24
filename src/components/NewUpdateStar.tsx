type NewUpdateStarProps = {
  show?: boolean;
  className?: string;
  title?: string;
};

export default function NewUpdateStar({
  show = true,
  className = "",
  title = "Added in the last 7 days",
}: NewUpdateStarProps) {
  if (!show) return null;

  return (
    <img
      src="/images/gold_spinning_star.gif"
      alt={title}
      title={title}
      className={`inline-block h-5 w-5 align-middle ${className}`}
    />
  );
}