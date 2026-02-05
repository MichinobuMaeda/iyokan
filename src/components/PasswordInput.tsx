import { useState, type InputHTMLAttributes } from "react";
import SvgVisibility from "../icons/SvgVisibility";
import SvgVisibilityOff from "../icons/SvgVisibilityOff";
import { TextField } from "glassine-paper";

export default function PasswordInput({
  id,
  name,
  label,
  error,
  supportingText,
  errorMessage,
  value,
  onChange,
  disabled,
  style,
}: {
  id?: string;
  name?: string;
  label?: string;
  error?: boolean;
  supportingText?: string;
  errorMessage?: string;
  value: string;
  onChange: InputHTMLAttributes<
    HTMLInputElement | HTMLTextAreaElement
  >["onChange"];
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      id={id}
      name={name}
      label={label}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={onChange}
      disabled={disabled}
      supportingText={supportingText}
      errorMessage={errorMessage}
      error={error}
      style={{ fontFamily: "monospace", ...style }}
      trailingIcon={
        <button type="button" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <SvgVisibilityOff /> : <SvgVisibility />}
        </button>
      }
    />
  );
}
