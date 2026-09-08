"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import type {
  DayOfWeek,
  NodeScheduleInterval,
} from "@/types/schedule";

type NodeScheduleManagerProps = {
  nodeId: string;
  intervals: NodeScheduleInterval[];
};

const DAYS: {
  value: DayOfWeek;
  label: string;
}[] = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

export function NodeScheduleManager({
  nodeId,
  intervals,
}: NodeScheduleManagerProps) {
  const router = useRouter();

  const [dayOfWeek, setDayOfWeek] =
    useState<DayOfWeek>("MONDAY");

  const [editingIntervalId, setEditingIntervalId] =
  useState<string | null>(null);

  const [startTime, setStartTime] =
    useState("08:00");

  const [endTime, setEndTime] =
    useState("12:00");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleAddInterval = async () => {
    setErrorMessage("");

    if (startTime >= endTime) {
      setErrorMessage(
        "La hora de inicio debe ser anterior a la hora de fin."
      );
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase.rpc(
      "add_node_schedule_interval",
      {
        p_node_id: nodeId,
        p_day_of_week: dayOfWeek,
        p_start_time: startTime,
        p_end_time: endTime,
      }
    );

    setIsSubmitting(false);

    if (error) {
      console.error(error);

      setErrorMessage(
        "No se pudo agregar el intervalo. Revisá que no se superponga con otro horario."
      );

      return;
    }

    router.refresh();
  };
  const handleEditInterval = (
  interval: NodeScheduleInterval
) => {
  setEditingIntervalId(interval.id);
  setDayOfWeek(interval.dayOfWeek);
  setStartTime(interval.startTime.slice(0, 5));
  setEndTime(interval.endTime.slice(0, 5));
  setErrorMessage("");
};
  
  const handleUpdateInterval = async () => {
  if (!editingIntervalId) {
    return;
  }

  setErrorMessage("");

  if (startTime >= endTime) {
    setErrorMessage(
      "La hora de inicio debe ser anterior a la hora de fin."
    );
    return;
  }

  setIsSubmitting(true);

  const supabase = createClient();

  const { error } = await supabase.rpc(
    "update_node_schedule_interval",
    {
      p_interval_id: editingIntervalId,
      p_day_of_week: dayOfWeek,
      p_start_time: startTime,
      p_end_time: endTime,
    }
  );

  setIsSubmitting(false);

  if (error) {
    console.error(error);

    setErrorMessage(
      "No se pudo actualizar el intervalo. Revisá que no se superponga con otro horario."
    );

    return;
  }

  setEditingIntervalId(null);
  router.refresh();
};

  const handleDeleteInterval = async (
    intervalId: string
  ) => {
    const supabase = createClient();

    const { error } = await supabase.rpc(
      "delete_node_schedule_interval",
      {
        p_interval_id: intervalId,
      }
    );

    if (error) {
      console.error(error);
      setErrorMessage(
        "No se pudo eliminar el intervalo."
      );
      return;
    }

    router.refresh();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Agregar intervalo
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Día
            </label>

            <select
              value={dayOfWeek}
              onChange={(event) =>
                setDayOfWeek(
                  event.target.value as DayOfWeek
                )
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            >
              {DAYS.map((day) => (
                <option
                  key={day.value}
                  value={day.value}
                >
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Desde
            </label>

            <input
              type="time"
              value={startTime}
              onChange={(event) =>
                setStartTime(event.target.value)
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Hasta
            </label>

            <input
              type="time"
              value={endTime}
              onChange={(event) =>
                setEndTime(event.target.value)
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}

        <div className="mt-4 flex gap-3">
  <button
    type="button"
    onClick={
      editingIntervalId
        ? handleUpdateInterval
        : handleAddInterval
    }
    disabled={isSubmitting}
    className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
  >
    {isSubmitting
      ? "Guardando..."
      : editingIntervalId
        ? "Guardar cambios"
        : "Agregar intervalo"}
  </button>

  {editingIntervalId && (
    <button
      type="button"
      onClick={() => {
        setEditingIntervalId(null);
        setDayOfWeek("MONDAY");
        setStartTime("08:00");
        setEndTime("12:00");
        setErrorMessage("");
      }}
      className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
    >
      Cancelar
    </button>
  )}
</div>
      </section>

      <section className="space-y-4">
        {DAYS.map((day) => {
          const dayIntervals = intervals
            .filter(
              (interval) =>
                interval.dayOfWeek === day.value
            )
            .sort((a, b) =>
              a.startTime.localeCompare(b.startTime)
            );

          return (
            <div
              key={day.value}
              className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900">
                {day.label}
              </h3>

              {dayIntervals.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  Sin horarios configurados.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {dayIntervals.map((interval) => (
                    <div
                      key={interval.id}
                      className="flex items-center justify-between rounded-md bg-slate-100 px-4 py-3"
                    >
                      <span className="font-medium text-slate-900">
                        {interval.startTime.slice(0, 5)}
                        {" — "}
                        {interval.endTime.slice(0, 5)}
                      </span>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => handleEditInterval(interval)}
                                className="text-sm font-medium text-slate-700 hover:text-slate-950"
                            >
                                Editar
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                handleDeleteInterval(interval.id)
                                }
                                className="text-sm font-medium text-red-600 hover:text-red-800"
                            >
                                Eliminar
                            </button>
                            </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}