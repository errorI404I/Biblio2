"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createClient } from "@/lib/supabase/client";
import type { UserNode } from "@/types/node";
import {
  updateNodeSchema,
  type UpdateNodeFormValues,
} from "@/validations/node";

type EditNodeFormProps = {
  node: UserNode;
};

const GpsLocationPicker = dynamic(
  () =>
    import("@/components/admin/GpsLocationPicker").then(
      (module) => module.GpsLocationPicker
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-600">
        Cargando mapa...
      </div>
    ),
  }
);

export function EditNodeForm({
  node,
}: EditNodeFormProps) {
  const router = useRouter();

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
  register,
  handleSubmit,
  watch,
  setValue,
  formState: {
    errors,
    isSubmitting,
  },
} = useForm<UpdateNodeFormValues>({
    resolver: zodResolver(updateNodeSchema),

    defaultValues: {
      name: node.name,
      description: node.description ?? "",
      validationMethod: node.validationMethod,
      latitude: node.latitude?.toString() ?? "",
      longitude: node.longitude?.toString() ?? "",
      radiusMeters: node.radiusMeters?.toString() ?? "",
      wifiPublicIp: node.wifiPublicIp ?? "",
      timezone: node.timezone,
      gracePeriodMinutes:
        node.gracePeriodSeconds / 60,
      isRankingVisible: node.isRankingVisible,
      isActive: node.isActive,
    },
  });

  const validationMethod = watch("validationMethod");
  const latitude = Number(watch("latitude"));
  const longitude = Number(watch("longitude"));
  const radiusMeters = Number(watch("radiusMeters"));

  const hasValidGpsPosition =
  Number.isFinite(latitude) &&
  Number.isFinite(longitude);
  const onSubmit = async (
    values: UpdateNodeFormValues
  ) => {
    setServerError("");
    setSuccessMessage("");

    const supabase = createClient();

    const { error } = await supabase.rpc(
      "update_node",
      {
        p_node_id: node.id,
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

        p_is_active:
          values.isActive,
      }
    );

    if (error) {
      console.error("Error updating node:", error);

      setServerError(
        "No se pudo actualizar el nodo."
      );

      return;
    }

    setSuccessMessage(
      "Nodo actualizado correctamente."
    );

    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-lg border border-slate-300 bg-white p-6 shadow-sm"
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
        {...register("validationMethod", {
        onChange(event) {
        if (
        event.target.value === "GPS" &&
        (!watch("latitude") ||
          !watch("longitude"))
      ) {
        setValue("latitude", "-34.6037");
        setValue("longitude", "-58.3816");
        setValue("radiusMeters", "50");
      }
    },
  })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        >
          <option value="WIFI">Wi-Fi</option>
          <option value="GPS">GPS</option>
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

          <p className="mt-2 text-sm text-slate-500">
            Conectate a la red Wi-Fi que querés usar para este
            nodo y buscá “cuál es mi IP” en el navegador.
            Copiá la dirección IPv4 pública que aparezca.
            No uses direcciones privadas como 192.168.x.x,
            10.x.x.x o 172.16.x.x.
          </p>

          {errors.wifiPublicIp && (
            <p className="mt-1 text-sm text-red-600">
              {errors.wifiPublicIp.message}
            </p>
          )}
        </div>
      )}

   {validationMethod === "GPS" && (
  <div className="space-y-4">
    <div>
      <h3 className="font-medium text-slate-900">
        Ubicación GPS
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Mové el marcador o hacé click sobre el mapa
        para elegir el centro del nodo.
      </p>
    </div>

    {hasValidGpsPosition ? (
      <GpsLocationPicker
        latitude={latitude}
        longitude={longitude}
        radiusMeters={
          Number.isFinite(radiusMeters) &&
          radiusMeters > 0
            ? radiusMeters
            : 1
        }
        onChange={(newLatitude, newLongitude) => {
          setValue(
            "latitude",
            newLatitude.toString(),
            { shouldValidate: true }
          );

          setValue(
            "longitude",
            newLongitude.toString(),
            { shouldValidate: true }
          );
        }}
      />
    ) : (
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        El nodo todavía no tiene una ubicación GPS válida.
      </div>
    )}

    <div>
      <label
        htmlFor="radiusMeters"
        className="mb-2 block font-medium text-slate-900"
      >
        Radio (metros)
      </label>

      <input
        id="radiusMeters"
        type="number"
        min="1"
        {...register("radiusMeters")}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
      />

      {errors.radiusMeters && (
        <p className="mt-1 text-sm text-red-600">
          {errors.radiusMeters.message}
        </p>
      )}
    </div>

    <div className="text-sm text-slate-500">
      Coordenadas seleccionadas:
      {" "}
      {latitude.toFixed(6)}, {longitude.toFixed(6)}
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
      </div>

      <div>
        <label
          htmlFor="gracePeriodMinutes"
          className="mb-2 block font-medium text-slate-900"
        >
          Tolerancia (minutos)
        </label>

        <input
          id="gracePeriodMinutes"
          type="number"
          {...register("gracePeriodMinutes", {
            valueAsNumber: true,
          })}
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

        Ranking visible
      </label>

      <label className="flex items-center gap-3 text-slate-900">
        <input
          type="checkbox"
          {...register("isActive")}
        />

        Nodo activo
      </label>

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
        className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {isSubmitting
          ? "Guardando..."
          : "Guardar cambios"}
      </button>
    </form>
  );
}