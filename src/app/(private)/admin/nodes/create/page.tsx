import { CreateNodeForm } from "@/components/admin/CreateNodeForm";

export default function CreateNodePage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Crear nodo
        </h2>

        <p className="mt-1 text-slate-600">
          Configurá las características principales del nuevo nodo.
        </p>
      </div>

      <CreateNodeForm />
    </div>
  );
}