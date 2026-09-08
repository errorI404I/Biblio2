"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createClient } from "@/lib/supabase/client";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/validations/profile";
import type { UserProfile } from "@/types/user";

type ProfileFormProps = {
  profile: UserProfile;
};

export function ProfileForm({
  profile,
}: ProfileFormProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),

    defaultValues: {
      displayName: profile.displayName,
      bio: profile.bio ?? "",
      avatarUrl: profile.avatarUrl ?? "",
    },
  });

  const onSubmit = async (
    values: ProfileFormValues
  ) => {
    setSuccessMessage("");
    setServerError("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setServerError("No hay una sesión válida.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: values.displayName,
        bio: values.bio || null,
        avatar_url: values.avatarUrl || null,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);

      setServerError(
        "No se pudieron guardar los cambios."
      );

      return;
    }

    setSuccessMessage(
      "Perfil actualizado correctamente."
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl space-y-6 rounded-lg border border-slate-300 bg-white p-6 shadow-sm"
    >
      <div>
        <label
          htmlFor="displayName"
          className="mb-2 block font-medium text-slate-900"
        >
          Nombre visible
        </label>

        <input
          id="displayName"
          {...register("displayName")}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
        />

        {errors.displayName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.displayName.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="bio"
          className="mb-2 block font-medium text-slate-900"
        >
          Bio
        </label>

        <textarea
          id="bio"
          {...register("bio")}
          rows={4}
          className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
        />

        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">
            {errors.bio.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="avatarUrl"
          className="mb-2 block font-medium text-slate-900"
        >
          URL del avatar
        </label>

        <input
          id="avatarUrl"
          {...register("avatarUrl")}
          placeholder="https://..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
        />

        {errors.avatarUrl && (
          <p className="mt-1 text-sm text-red-600">
            {errors.avatarUrl.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm font-medium text-red-600">
          {serverError}
        </p>
      )}

      {successMessage && (
        <p className="text-sm font-medium text-green-700">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "Guardando..."
          : "Guardar cambios"}
      </button>
    </form>
  );
}