import { useEffect, useRef } from "react";
import type { User } from "../api/types";
import { useResponsiveColumns } from "../hooks/useResponsiveColumns";
import { UserCard } from "./UserCard";

const ROW_GAP = 16;

export function UserList({
  users,
  hasMore,
  loadingMore,
  loadMoreError,
  onLoadMore,
  hasPrevious,
  loadingPrevious,
  loadPreviousError,
  onLoadPrevious,
}: {
  users: User[];
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreError: string | null;
  onLoadMore: () => void;
  hasPrevious: boolean;
  loadingPrevious: boolean;
  loadPreviousError: string | null;
  onLoadPrevious: () => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const columns = useResponsiveColumns(parentRef);

  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;
  const onLoadPreviousRef = useRef(onLoadPrevious);
  onLoadPreviousRef.current = onLoadPrevious;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = parentRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { root, rootMargin: "600px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    const root = parentRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadPreviousRef.current();
        }
      },
      { root, rootMargin: "600px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasPrevious]);

  return (
    <div ref={parentRef} className="h-[calc(100vh-130px)] min-h-[400px] overflow-y-auto">
      {hasPrevious && <div ref={topSentinelRef} />}
      {loadingPrevious && (
        <div className="py-4 text-center text-sm text-slate-500">Loading more…</div>
      )}
      {!loadingPrevious && loadPreviousError && (
        <div className="py-4 text-center text-sm text-red-600">
          {loadPreviousError}{" "}
          <button onClick={onLoadPrevious} className="underline">
            Retry
          </button>
        </div>
      )}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: ROW_GAP,
        }}
      >
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} />}
      {loadingMore && (
        <div className="py-4 text-center text-sm text-slate-500">Loading more…</div>
      )}
      {!loadingMore && loadMoreError && (
        <div className="py-4 text-center text-sm text-red-600">
          {loadMoreError}{" "}
          <button onClick={onLoadMore} className="underline">
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
