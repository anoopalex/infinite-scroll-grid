import type { User } from "../api/types";

const VISIBLE_HOBBIES = 2;

export function UserCard({ user }: { user: User }) {
  const visibleHobbies = user.hobbies.slice(0, VISIBLE_HOBBIES);
  const remaining = user.hobbies.length - visibleHobbies.length;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <img
          src={user.avatar}
          alt=""
          className="h-12 w-12 shrink-0 rounded-full bg-slate-100"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">
            {user.first_name} {user.last_name}
          </p>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span className="truncate">{user.nationality}</span>
            <span className="shrink-0 pl-2">{user.age}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-1.5">
        {visibleHobbies.length === 0 && remaining === 0 && (
          <span className="text-xs text-slate-400">No hobbies listed</span>
        )}
        {visibleHobbies.map((hobby) => (
          <span
            key={hobby}
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
          >
            {hobby}
          </span>
        ))}
        {remaining > 0 && (
          <span
            title={user.hobbies.join(", ")}
            className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white"
          >
            +{remaining}
          </span>
        )}
      </div>
    </div>
  );
}
