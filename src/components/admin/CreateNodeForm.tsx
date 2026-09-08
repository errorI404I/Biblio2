"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createClient } from "@/lib/supabase/client";
import {
  createNodeSchema,
  type CreateNodeFormValues,
} from "@/validations/node";

export function CreateNodeForm() {
  const router = useRouter();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CreateNodeFormValues>({
    resolver: zodResolver(createNodeSchema),

    defaultValues: {
      name: "",
      description: "",
      validationMethod: "WIFI",
      latitude: "",
      longitude: "",
      radiusMeters: "",
      wifiPublicIp: "",
      timezone: "America/Argentina/Buenos_Aires",
      gracePeriodMinutes: 5,
      isRankingVisible: true,
    },
  });

  const validationMethod = watch("validationMethod");

  const onSubmit = async (
    values: CreateNodeFormValues
  ) => {
    setServerError("");

    const supabase = createClient();

    const { data: nodeId, error } = await supabase.rpc(
      "create_node",
      {
        p_name: values.name,
        p_description: values.description,
        p_validation_method: values.validationMethod,

        p_latitude:
          values.validationMethod === "GPS"
            ? Number(values.latitude)
            : null,

        p_longitude:
          values.validationMethod === "GPS"
            ? Number(values.longitude)
            : null,

        p_radius_meters:
          values.validationMethod === "GPS"
            ? Number(values.radiusMeters)
            : null,

        p_wifi_public_ip:
          values.validationMethod === "WIFI"
            ? values.wifiPublicIp
            : null,

        p_timezone: values.timezone,

        p_grace_period_seconds:
          values.gracePeriodMinutes * 60,

        p_is_ranking_visible:
          values.isRankingVisible,
      }
    );

    if (error) {
      console.error("Error creating node:", error);

      setServerError(
        "No se pudo crear el nodo."
      );

      return;
    }

    router.push(`/admin/nodes/${nodeId}`);
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-6 rounded-lg border border-slate-300 bg-white p-6 shadow-sm"
    >
      <div>
        <label
          htmlFor="name"
          className="mb-2 block font-medium text-slate-900"
        >
          Nombre
        </label>

        <input
          id="name"
          {...register("name")}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block font-medium text-slate-900"
        >
          Descripción
        </label>

        <textarea
          id="description"
          {...register("description")}
          rows={3}
          className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        />

        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="validationMethod"
          className="mb-2 block font-medium text-slate-900"
        >
          Método de validación
        </label>

        <select
          id="validationMethod"
          {...register("validationMethod")}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        >
          <option value="WIFI">
            Wi-Fi
          </option>

          <option value="GPS">
            GPS
          </option>
        </select>
      </div>

      {validationMethod === "WIFI" && (
        <div>
          <label
            htmlFor="wifiPublicIp"
            className="mb-2 block font-medium text-slate-900"
          >
            IP pública del Wi-Fi
          </label>

          <input
            id="wifiPublicIp"
            {...register("wifiPublicIp")}
            placeholder="Ej: 190.123.45.67"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />

          <p className="mt-1 text-sm text-slate-500">
            Debe ser la IP pública observada desde Internet,
            no una IP privada como 192.168.x.x.
          </p>

          {errors.wifiPublicIp && (
            <p className="mt-1 text-sm text-red-600">
              {errors.wifiPublicIp.message}
            </p>
          )}
        </div>
      )}

      {validationMethod === "GPS" && (
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="latitude"
              className="mb-2 block font-medium text-slate-900"
            >
              Latitud
            </label>

            <input
              id="latitude"
              {...register("latitude")}
              placeholder="-34.6037"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            />

            {errors.latitude && (
              <p className="mt-1 text-sm text-red-600">
                {errors.latitude.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="longitude"
              className="mb-2 block font-medium text-slate-900"
            >
              Longitud
            </label>

            <input
              id="longitude"
              {...register("longitude")}
              placeholder="-58.3816"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            />

            {errors.longitude && (
              <p className="mt-1 text-sm text-red-600">
                {errors.longitude.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="radiusMeters"
              className="mb-2 block font-medium text-slate-900"
            >
              Radio (metros)
            </label>

            <input
              id="radiusMeters"
              {...register("radiusMeters")}
              placeholder="50"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            />

            {errors.radiusMeters && (
              <p className="mt-1 text-sm text-red-600">
                {errors.radiusMeters.message}
              </p>
            )}
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="timezone"
          className="mb-2 block font-medium text-slate-900"
        >
          Zona horaria
        </label>

        <input
          id="timezone"
          {...register("timezone")}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        />

        {errors.timezone && (
          <p className="mt-1 text-sm text-red-600">
            {errors.timezone.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="gracePeriodMinutes"
          className="mb-2 block font-medium text-slate-900"
        >
          Período de tolerancia (minutos)
        </label>

        <input
          id="gracePeriodMinutes"
          type="number"
          {...register(
            "gracePeriodMinutes",
            { valueAsNumber: true }
          )}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        />

        {errors.gracePeriodMinutes && (
          <p className="mt-1 text-sm text-red-600">
            {errors.gracePeriodMinutes.message}
          </p>
        )}
      </div>

      <label className="flex items-center gap-3 text-slate-900">
        <input
          type="checkbox"
          {...register("isRankingVisible")}
        />

        Ranking visible para los miembros
      </label>

      {serverError && (
        <p className="text-sm font-medium text-red-600">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "Creando..."
          : "Crear nodo"}
      </button>
    </form>
  );
}