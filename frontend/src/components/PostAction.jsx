export default function PostAction({ icon, text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        flex items-center justify-center gap-2
        h-10
        flex-1
        rounded-xl
        text-base-content/70
        hover:bg-base-200
        hover:text-primary
        transition-all duration-200
        font-medium
      "
    >
      <span className="flex items-center justify-center">{icon}</span>

      <span className="hidden sm:inline text-sm">{text}</span>
    </button>
  );
}
