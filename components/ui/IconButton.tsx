import { ButtonHTMLAttributes } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function IconButton({
  className = "",
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      className={`
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-full
        border
        border-stone-200
        bg-white
        text-stone-600
        shadow-sm
        transition-all
        duration-200
        hover:shadow-md
        active:scale-95
        ${className}
      `}
    >
      {children}
    </button>
  );
}