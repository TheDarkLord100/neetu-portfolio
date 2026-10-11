"use client";

import { useActionState, useState } from "react";
import { signIn, type LoginState } from "@/app/admin/actions";
import type { AdminMessages } from "@/lib/admin/messages";

const initial: LoginState = { error: null, email: "" };

const field =
  "h-13 w-full rounded-control border border-line-strong bg-paper-raised px-4 text-ui text-ink placeholder:text-ink-soft";
const label = "mb-2 block text-ui font-semibold";

export function LoginForm({ messages: m }: { messages: AdminMessages["login"] }) {
  const [state, action, pending] = useActionState(signIn, initial);
  const [showPassword, setShowPassword] = useState(false);
  const error = state.error ? m.errors[state.error] : null;

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {error && (
        <p id="login-error" role="alert" className="rounded-control border border-l-4 border-walnut bg-label-paper px-4 py-3 text-ui font-semibold">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="email" className={label}>
          {m.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={state.email}
          aria-describedby={error ? "login-error" : undefined}
          className={field}
        />
      </div>
      <div>
        <label htmlFor="password" className={label}>
          {m.password}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-describedby={error ? "login-error" : undefined}
            className={`${field} pr-24`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-1 inline-flex min-h-11 -translate-y-1/2 items-center rounded-control px-3 text-meta font-semibold text-walnut"
          >
            {showPassword ? m.hidePassword : m.showPassword}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-13 w-full items-center justify-center rounded-control bg-walnut px-6 text-ui font-semibold text-on-walnut hover:bg-walnut-dark disabled:cursor-default disabled:opacity-45"
      >
        {pending ? m.submitting : m.submit}
      </button>
      <p className="text-meta text-ink-soft">{m.forgot}</p>
    </form>
  );
}
