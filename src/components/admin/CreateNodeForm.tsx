"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createClient } from "@/lib/supabase/client";

import type { DayOfWeek } from "@/types/schedule";

import {
  createNodeSchema,
  type CreateNodeFormValues,
} from "@/validations/node";

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

const WEEKDAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

const WEEKEND: DayOfWeek[] = [
  "SATURDAY",
  "SUNDAY",
];

export function CreateNodeForm() {
  const router = useRouter();

  const [serverError, setServerError] =
    useState("");

  /*
   * Horario inicial.
   *
   * Por defecto proponemos lunes a viernes,
   * de 08:00 a 17:00.
   */
  const [selectedDays, setSelectedDays] =
    useState<DayOfWeek[]>([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ]);

  const [
    scheduleStartTime,
    setScheduleStartTime,
  ] = useState("08:00");

  const [
    scheduleEndTime,
    setScheduleEndTime,
  ] = useState("17:00");

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
      timezone:
        "America/Argentina/Buenos_Aires",
      gracePeriodMinutes: 5,
      isRankingVisible: true,
    },
  });

  const validationMethod = watch(
    "validationMethod"
  );

  /*
   * Marca o desmarca individualmente
   * uno de los siete días.
   */
  const toggleDay = (
    day: DayOfWeek
  ) => {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter(
            (selectedDay) =>
              selectedDay !== day
          )
        : [...current, day]
    );
  };

  /*
   * Presets rápidos para evitar tener
   * que marcar día por día.
   */
  const applyPreset = (
    preset:
      | "WEEKDAYS"
      | "ALL"
      | "WEEKEND"
  ) => {
    if (preset === "WEEKDAYS") {
      setSelectedDays(WEEKDAYS);
      return;
    }

    if (preset === "WEEKEND") {
      setSelectedDays(WEEKEND);
      return;
    }

    setSelectedDays(
      DAYS.map((day) => day.value)
    );
  };

  const onSubmit = async (
    values: CreateNodeFormValues
  ) => {
    setServerError("");

    /*
     * Si hay días seleccionados,
     * verificamos el horario.
     */
    if (
      selectedDays.length > 0 &&
      scheduleStartTime >= scheduleEndTime
    ) {
      setServerError(
        "En el horario inicial, la hora de inicio debe ser anterior a la hora de fin."
      );

      return;
    }

    const supabase = createClient();

    /*
     * 1. Creamos primero el nodo.
     */
    const {
      data: nodeId,
      error,
    } = await supabase.rpc(
      "create_node",
      {
        p_name: values.name,

        p_description:
          values.description,

        p_validation_method:
          values.validationMethod,

        p_latitude:
          values.validationMethod ===
          "GPS"
            ? Number(values.latitude)
            : null,

        p_longitude:
          values.validationMethod ===
          "GPS"
            ? Number(values.longitude)
            : null,

        p_radius_meters:
          values.validationMethod ===
          "GPS"
            ? Number(
                values.radiusMeters
              )
            : null,

        p_wifi_public_ip:
          values.validationMethod ===
          "WIFI"
            ? values.wifiPublicIp
            : null,

        p_timezone:
          values.timezone,

        p_grace_period_seconds:
          values.gracePeriodMinutes *
          60,

        p_is_ranking_visible:
          values.isRankingVisible,
      }
    );

    if (error || !nodeId) {
      console.error(
        "Error creating node:",
        error
      );

      setServerError(
        "No se pudo crear el nodo."
      );

      return;
    }

    /*
     * 2. El nodo ya existe.
     *
     * Ahora agregamos el mismo intervalo
     * a cada día seleccionado.
     */
    if (selectedDays.length > 0) {
      for (const day of selectedDays) {
        const {
          error: scheduleError,
        } = await supabase.rpc(
          "add_node_schedule_interval",
          {
            p_node_id: nodeId,
            p_day_of_week: day,
            p_start_time:
              scheduleStartTime,
            p_end_time:
              scheduleEndTime,
          }
        );

        if (scheduleError) {
          console.error(
            `Error creando horario para ${day}:`,
            scheduleError
          );

          /*
           * El nodo ya fue creado.
           *
           * No lo borramos. Mandamos al
           * admin a su panel para que
           * pueda corregir el horario.
           */
          router.push(
            `/admin/nodes/${nodeId}`
          );

          router.refresh();

          return;
        }
      }
    }

    /*
     * 3. Todo listo.
     */
    router.push(
      `/admin/nodes/${nodeId}`
    );

    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-6 rounded-lg border border-slate-300 bg-white p-6 shadow-sm"
    >
      {/* Nombre */}
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

      {/* Descripción */}
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

      {/* Método de validación */}
      <div>
        <label
          htmlFor="validationMethod"
          className="mb-2 block font-medium text-slate-900"
        >
          Método de validación
        </label>

        <select
          id="validationMethod"
          {...register(
            "validationMethod"
          )}
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

      {/* Wi-Fi */}
      {validationMethod ===
        "WIFI" && (
        <div>
          <label
            htmlFor="wifiPublicIp"
            className="mb-2 block font-medium text-slate-900"
          >
            IP pública del Wi-Fi
          </label>

          <input
            id="wifiPublicIp"
            {...register(
              "wifiPublicIp"
            )}
            placeholder="Ej: 190.123.45.67"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />

          <p className="mt-1 text-sm text-slate-500">
            Debe ser la IP pública
            observada desde Internet, no
            una IP privada como
            192.168.x.x.
          </p>

          {errors.wifiPublicIp && (
            <p className="mt-1 text-sm text-red-600">
              {
                errors.wifiPublicIp
                  .message
              }
            </p>
          )}
        </div>
      )}

      {/* GPS */}
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
                {
                  errors.latitude
                    .message
                }
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
              {...register(
                "longitude"
              )}
              placeholder="-58.3816"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            />

            {errors.longitude && (
              <p className="mt-1 text-sm text-red-600">
                {
                  errors.longitude
                    .message
                }
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
              {...register(
                "radiusMeters"
              )}
              placeholder="50"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            />

            {errors.radiusMeters && (
              <p className="mt-1 text-sm text-red-600">
                {
                  errors.radiusMeters
                    .message
                }
              </p>
            )}
          </div>
        </div>
      )}

      {/* Zona horaria */}
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

      {/* Tolerancia */}
      <div>
        <label
          htmlFor="gracePeriodMinutes"
          className="mb-2 block font-medium text-slate-900"
        >
          Período de tolerancia
          (minutos)
        </label>

        <input
          id="gracePeriodMinutes"
          type="number"
          {...register(
            "gracePeriodMinutes",
            {
              valueAsNumber: true,
            }
          )}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        />

        {errors.gracePeriodMinutes && (
          <p className="mt-1 text-sm text-red-600">
            {
              errors
                .gracePeriodMinutes
                .message
            }
          </p>
        )}
      </div>

      {/* Horario inicial */}
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
        <div>
          <h3 className="font-semibold text-slate-900">
            Horario inicial
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            Elegí los días en los que
            funcionará el nodo. Después
            vas a poder editar cada día
            por separado.
          </p>
        </div>

        {/* Presets */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              applyPreset(
                "WEEKDAYS"
              )
            }
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Días hábiles
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset("ALL")
            }
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Todos los días
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset(
                "WEEKEND"
              )
            }
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Fin de semana
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedDays([])
            }
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Ninguno
          </button>
        </div>

        {/* Días */}
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DAYS.map((day) => {
            const selected =
              selectedDays.includes(
                day.value
              );

            return (
              <label
                key={day.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 ${
                  selected
                    ? "border-slate-900 bg-white"
                    : "border-slate-300 bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    toggleDay(
                      day.value
                    )
                  }
                />

                <span className="text-sm font-medium text-slate-900">
                  {day.label}
                </span>
              </label>
            );
          })}
        </div>

        {/* Horas */}
        {selectedDays.length > 0 && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="scheduleStartTime"
                className="mb-2 block text-sm font-medium text-slate-900"
              >
                Desde
              </label>

              <input
                id="scheduleStartTime"
                type="time"
                value={
                  scheduleStartTime
                }
                onChange={(event) =>
                  setScheduleStartTime(
                    event.target.value
                  )
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="scheduleEndTime"
                className="mb-2 block text-sm font-medium text-slate-900"
              >
                Hasta
              </label>

              <input
                id="scheduleEndTime"
                type="time"
                value={
                  scheduleEndTime
                }
                onChange={(event) =>
                  setScheduleEndTime(
                    event.target.value
                  )
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
              />
            </div>
          </div>
        )}

        {selectedDays.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">
            El nodo se creará sin
            horarios. Podrás agregarlos
            después desde administración.
          </p>
        )}
      </section>

      {/* Ranking */}
      <label className="flex items-center gap-3 text-slate-900">
        <input
          type="checkbox"
          {...register(
            "isRankingVisible"
          )}
        />

        Ranking visible para los miembros
      </label>

      {/* Errores */}
      {serverError && (
        <p className="text-sm font-medium text-red-600">
          {serverError}
        </p>
      )}

      {/* Crear */}
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