import clsx from "clsx";
import {
  useState,
  DetailedHTMLProps,
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
} from "react";

interface TextFieldProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: string;
  error?: string;
  checked?: boolean;
  leftAdornment?: ReactNode;
  leftAdornmentClassnames?: string;
  rightAdornment?: ReactNode;
  rightAdornmentClassnames?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const TextField = ({
  type = "input",
  leftAdornment,
  leftAdornmentClassnames,
  rightAdornment,
  rightAdornmentClassnames,
  className,
  label,
  error,
  checked,
  ...props
}: TextFieldProps) => {
  const [isChecked, setIsChecked] =
    useState<TextFieldProps["checked"]>(checked);

  const handleCheck = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    if (props.onChange) {
      const event = {
        target: {
          type: "checkbox",
          checked: newValue,
        },
      } as ChangeEvent<HTMLInputElement>;
      props.onChange(event);
    }
  };

  return (
    <div className={clsx("space-y-1", { "w-full": type !== "checkbox" })}>
      {label && <label className="text-sm font-semibold">{label}</label>}
      {type === "checkbox" ? (
        <div
          className={clsx("checkbox", { checked: isChecked }, className)}
          onClick={handleCheck}
        >
          <div className={clsx("checkmark", { hidden: !isChecked })} />
        </div>
      ) : (
        <div className="relative w-full">
          {leftAdornment && (
            <div
              className={clsx(
                "absolute left-4 top-1/2 -translate-y-1/2 transform",
                leftAdornmentClassnames
              )}
            >
              {leftAdornment}
            </div>
          )}
          <input
            className={clsx(
              "focus:ring-3 w-full rounded-lg border-2 border-zinc-500 bg-transparent p-4 text-sm text-zinc-500 outline-none transition-all placeholder:text-zinc-500/40 focus:border-zinc-500 focus:ring-zinc-500/20",
              props.disabled
                ? "cursor-default opacity-50"
                : "cursor-text hover:border-zinc-500 hover:bg-zinc-100",
              { "border-red-500": error },
              { "!pl-10": leftAdornment },
              { "!pr-10": rightAdornment },

              className
            )}
            type={type}
            {...props}
          />
          {rightAdornment && (
            <div
              className={clsx(
                "absolute right-4 top-1/2 -translate-y-1/2 transform",
                rightAdornmentClassnames
              )}
            >
              {rightAdornment}
            </div>
          )}
        </div>
      )}
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  );
};

export default TextField;
