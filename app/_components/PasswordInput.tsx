"use client";

import { useState, InputHTMLAttributes } from "react";
import SvgVisibility from "@/app/_icons/SvgVisibility";
import SvgVisibilityOff from "@/app/_icons/SvgVisibilityOff";

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  helperText?: string;
}

export default function PasswordInput({
  id,
  name,
  label,
  error,
  helperText,
  value,
  onChange,
  disabled,
  required,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className={`textfield outlined${error ? " error" : ""}`}
      style={{ width: "100%" }}
    >
      <label>{label}</label>
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={label}
        disabled={disabled}
        style={{ fontFamily: "monospace" }}
      />
      <button type="button" onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? <SvgVisibilityOff /> : <SvgVisibility />}
      </button>
      <div>{error || helperText}</div>
    </div>
  );
}
