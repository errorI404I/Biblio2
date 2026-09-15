"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import type { UserNode } from "@/types/node";
import { updateNodeSchema, type UpdateNodeFormValues } from "@/validations/node";

const GpsLocationPicker = dynamic(() => import("@/components/admin/GpsLocationPicker").then((module) => module.GpsLocationPicker), { ssr: false, loading: () => <div className="flex h-[400px] items-center justify-center rounded-lg bg-slate-100 text-slate-600">Cargando mapa...</div> });

export function EditNodeForm({ node }: { node: UserNode }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<UpdateNodeFormValues>({
    resolver: zodResolver(updateNodeSchema),
    defaultValues: { name: node.name, description: node.description ?? "", latitude: node.latitude?.toString() ?? "-34.6037", longitude: node.longitude?.toString() ?? "-58.3816", radiusMeters: node.radiusMeters?.toString() ?? "50", timezone: node.timezone, gracePeriodMinutes: node.gracePeriodSeconds / 60, isRankingVisible: node.isRankingVisible, isActive: node.isActive },
  });
  const [latitudeValue, longitudeValue, radiusValue] = useWatch({ control, name: ["latitude", "longitude", "radiusMeters"] });
  const latitude = Number(latitudeValue); const longitude = Number(longitudeValue); const radiusMeters = Number(radiusValue);

  async function onSubmit(values: UpdateNodeFormValues) {
    setServerError(""); setSuccessMessage("");
    const { error } = await createClient().rpc("update_node", {
      p_node_id: node.id, p_name: values.name, p_description: values.description,
      // Compatibilidad temporal: la firma conserva campos legacy; toda edición Web migra el nodo a GPS.
      p_validation_method: "GPS", p_latitude: Number(values.latitude), p_longitude: Number(values.longitude), p_radius_meters: Number(values.radiusMeters), p_wifi_public_ip: null,
      p_timezone: values.timezone, p_grace_period_seconds: values.gracePeriodMinutes * 60, p_is_ranking_visible: values.isRankingVisible, p_is_active: values.isActive,
    });
    if (error) { console.error("Error updating node:", error); setServerError("No se pudo actualizar el nodo."); return; }
    setSuccessMessage("Nodo actualizado correctamente."); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
      <Field label="Nombre" error={errors.name?.message}><input {...register("name")} className="input" /></Field>
      <Field label="Descripción" error={errors.description?.message}><textarea {...register("description")} rows={3} className="input resize-none" /></Field>
      {node.validationMethod === "WIFI" && <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Este nodo usa una configuración Wi-Fi legacy. Al guardar, se convertirá a GPS.</p>}
      <section className="space-y-4"><div><h3 className="font-medium text-slate-900">Ubicación GPS</h3><p className="mt-1 text-sm text-slate-500">Mové el marcador o hacé click sobre el mapa para definir el área del nodo.</p></div>
        <GpsLocationPicker latitude={latitude} longitude={longitude} radiusMeters={Number.isFinite(radiusMeters) && radiusMeters > 0 ? radiusMeters : 1} onChange={(lat, lng) => { setValue("latitude", lat.toString(), { shouldValidate: true }); setValue("longitude", lng.toString(), { shouldValidate: true }); }} />
        <div className="grid gap-4 sm:grid-cols-3"><Field label="Latitud" error={errors.latitude?.message}><input {...register("latitude")} className="input" /></Field><Field label="Longitud" error={errors.longitude?.message}><input {...register("longitude")} className="input" /></Field><Field label="Radio (metros)" error={errors.radiusMeters?.message}><input type="number" min="1" {...register("radiusMeters")} className="input" /></Field></div>
      </section>
      <Field label="Zona horaria" error={errors.timezone?.message}><input {...register("timezone")} className="input" /></Field>
      <Field label="Tolerancia (minutos)" error={errors.gracePeriodMinutes?.message}><input type="number" {...register("gracePeriodMinutes", { valueAsNumber: true })} className="input" /></Field>
      <label className="flex items-center gap-3 text-slate-900"><input type="checkbox" {...register("isRankingVisible")} /> Ranking visible</label>
      <label className="flex items-center gap-3 text-slate-900"><input type="checkbox" {...register("isActive")} /> Nodo activo</label>
      {serverError && <p className="text-sm font-medium text-red-600">{serverError}</p>}{successMessage && <p className="text-sm font-medium text-green-700">{successMessage}</p>}
      <button type="submit" disabled={isSubmitting} className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-50">{isSubmitting ? "Guardando..." : "Guardar cambios"}</button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div><label className="mb-2 block font-medium text-slate-900">{label}</label>{children}{error && <p className="mt-1 text-sm text-red-600">{error}</p>}</div>; }
