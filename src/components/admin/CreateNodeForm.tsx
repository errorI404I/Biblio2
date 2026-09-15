"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import type { DayOfWeek } from "@/types/schedule";
import { createNodeSchema, type CreateNodeFormValues } from "@/validations/node";

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: "MONDAY", label: "Lunes" }, { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" }, { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" }, { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];
const WEEKDAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const WEEKEND: DayOfWeek[] = ["SATURDAY", "SUNDAY"];
const GpsLocationPicker = dynamic(() => import("@/components/admin/GpsLocationPicker").then((module) => module.GpsLocationPicker), { ssr: false, loading: () => <div className="flex h-[400px] items-center justify-center rounded-lg bg-slate-100 text-slate-600">Cargando mapa...</div> });

export function CreateNodeForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(WEEKDAYS);
  const [scheduleStartTime, setScheduleStartTime] = useState("08:00");
  const [scheduleEndTime, setScheduleEndTime] = useState("17:00");
  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<CreateNodeFormValues>({
    resolver: zodResolver(createNodeSchema),
    defaultValues: { name: "", description: "", latitude: "-34.6037", longitude: "-58.3816", radiusMeters: "50", timezone: "America/Argentina/Buenos_Aires", gracePeriodMinutes: 5, isRankingVisible: true },
  });
  const [latitudeValue, longitudeValue, radiusValue] = useWatch({ control, name: ["latitude", "longitude", "radiusMeters"] });
  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);
  const radiusMeters = Number(radiusValue);

  function toggleDay(day: DayOfWeek) {
    setSelectedDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  }

  async function onSubmit(values: CreateNodeFormValues) {
    setServerError("");
    if (selectedDays.length > 0 && scheduleStartTime >= scheduleEndTime) {
      setServerError("En el horario inicial, la hora de inicio debe ser anterior a la hora de fin."); return;
    }
    const supabase = createClient();
    const { data: nodeId, error } = await supabase.rpc("create_node", {
      p_name: values.name, p_description: values.description,
      // Compatibilidad temporal: las columnas legacy siguen en el RPC, pero la Web solo crea GPS.
      p_validation_method: "GPS", p_latitude: Number(values.latitude), p_longitude: Number(values.longitude),
      p_radius_meters: Number(values.radiusMeters), p_wifi_public_ip: null,
      p_timezone: values.timezone, p_grace_period_seconds: values.gracePeriodMinutes * 60,
      p_is_ranking_visible: values.isRankingVisible,
    });
    if (error || !nodeId) { console.error("Error creating node:", error); setServerError("No se pudo crear el nodo."); return; }
    for (const day of selectedDays) {
      const { error: scheduleError } = await supabase.rpc("add_node_schedule_interval", { p_node_id: nodeId, p_day_of_week: day, p_start_time: scheduleStartTime, p_end_time: scheduleEndTime });
      if (scheduleError) { console.error(`Error creando horario para ${day}:`, scheduleError); router.push(`/admin/nodes/${nodeId}`); router.refresh(); return; }
    }
    router.push(`/admin/nodes/${nodeId}`); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6 rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
      <Field label="Nombre" error={errors.name?.message}><input id="name" {...register("name")} className="input" /></Field>
      <Field label="Descripción" error={errors.description?.message}><textarea id="description" {...register("description")} rows={3} className="input resize-none" /></Field>
      <section className="space-y-4"><div><h3 className="font-medium text-slate-900">Ubicación GPS</h3><p className="mt-1 text-sm text-slate-500">Todos los nodos usan GPS. Mové el marcador o hacé click en el mapa para elegir el centro.</p></div>
        <GpsLocationPicker latitude={latitude} longitude={longitude} radiusMeters={Number.isFinite(radiusMeters) && radiusMeters > 0 ? radiusMeters : 1} onChange={(lat, lng) => { setValue("latitude", lat.toString(), { shouldValidate: true }); setValue("longitude", lng.toString(), { shouldValidate: true }); }} />
        <div className="grid gap-4 sm:grid-cols-3"><Field label="Latitud" error={errors.latitude?.message}><input id="latitude" {...register("latitude")} className="input" /></Field><Field label="Longitud" error={errors.longitude?.message}><input id="longitude" {...register("longitude")} className="input" /></Field><Field label="Radio (metros)" error={errors.radiusMeters?.message}><input id="radiusMeters" type="number" min="1" {...register("radiusMeters")} className="input" /></Field></div>
      </section>
      <Field label="Zona horaria" error={errors.timezone?.message}><input id="timezone" {...register("timezone")} className="input" /></Field>
      <Field label="Período de tolerancia (minutos)" error={errors.gracePeriodMinutes?.message}><input id="gracePeriodMinutes" type="number" {...register("gracePeriodMinutes", { valueAsNumber: true })} className="input" /></Field>
      <section><h3 className="font-medium text-slate-900">Horario inicial</h3><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setSelectedDays(WEEKDAYS)} className="chip">Lunes a viernes</button><button type="button" onClick={() => setSelectedDays(DAYS.map((day) => day.value))} className="chip">Todos</button><button type="button" onClick={() => setSelectedDays(WEEKEND)} className="chip">Fin de semana</button></div><div className="mt-3 flex flex-wrap gap-2">{DAYS.map((day) => <button key={day.value} type="button" onClick={() => toggleDay(day.value)} className={`chip ${selectedDays.includes(day.value) ? "bg-slate-900 text-white" : ""}`}>{day.label}</button>)}</div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Desde"><input type="time" value={scheduleStartTime} onChange={(event) => setScheduleStartTime(event.target.value)} className="input" /></Field><Field label="Hasta"><input type="time" value={scheduleEndTime} onChange={(event) => setScheduleEndTime(event.target.value)} className="input" /></Field></div></section>
      <label className="flex items-center gap-3 text-slate-900"><input type="checkbox" {...register("isRankingVisible")} /> Ranking visible</label>
      {serverError && <p className="text-sm font-medium text-red-600">{serverError}</p>}
      <button type="submit" disabled={isSubmitting} className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-50">{isSubmitting ? "Creando..." : "Crear nodo GPS"}</button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div><label className="mb-2 block font-medium text-slate-900">{label}</label>{children}{error && <p className="mt-1 text-sm text-red-600">{error}</p>}</div>; }
