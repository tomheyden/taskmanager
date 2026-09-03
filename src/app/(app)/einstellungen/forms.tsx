"use client";

import { useActionState } from "react";
import { changePassword, updateProfile, type SettingsState } from "@/actions/settings";
import { ColorPicker } from "@/components/ColorPicker";

const PERSON_COLORS = ["#8fb3ff", "#d9a3f2", "#86bd9f", "#e8b658", "#f27f6f", "#7fd0d6", "#c9b8ff", "#f0a35e"];

function Feedback({ state }: { state: SettingsState }) {
  if (state.error) {
    return (
      <p role="alert" className="text-[13px] text-urgent">
        {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p role="status" className="text-[13px] text-calm">
        {state.ok}
      </p>
    );
  }
  return null;
}

export function ProfileForm({ name, color }: { name: string; color: string }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateProfile, {});
  return (
    <form action={action} className="panel space-y-4 px-5 py-4">
      <div className="max-w-xs">
        <label className="label" htmlFor="name">
          Anzeigename
        </label>
        <input id="name" name="name" defaultValue={name} required minLength={2} className="input" />
      </div>
      <div>
        <span className="label">Deine Farbe</span>
        <ColorPicker name="color" value={color} colors={PERSON_COLORS} />
      </div>
      <Feedback state={state} />
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Wird gespeichert…" : "Profil speichern"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(changePassword, {});
  return (
    <form action={action} className="panel space-y-4 px-5 py-4">
      <div className="grid max-w-lg gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="current">
            Aktuelles Passwort
          </label>
          <input
            id="current"
            name="current"
            type="password"
            autoComplete="current-password"
            required
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="next">
            Neues Passwort
          </label>
          <input
            id="next"
            name="next"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="repeat">
            Wiederholen
          </label>
          <input
            id="repeat"
            name="repeat"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="input"
          />
        </div>
      </div>
      <Feedback state={state} />
      <button type="submit" className="btn-ghost" disabled={pending}>
        {pending ? "Wird geändert…" : "Passwort ändern"}
      </button>
    </form>
  );
}
