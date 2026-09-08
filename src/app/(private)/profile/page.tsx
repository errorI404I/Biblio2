import { ProfileForm } from "@/components/profile/ProfileForm";
import { getCurrentUserProfile } from "@/lib/api/profile";

export default async function ProfilePage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Perfil
        </h2>

        <p className="mt-4 text-red-600">
          No se pudo cargar el perfil.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Mi perfil
        </h2>

        <p className="mt-1 text-slate-600">
          Esta información será visible dentro de los nodos
          a los que pertenecés.
        </p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}