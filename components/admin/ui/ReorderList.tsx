"use client";

import { ReactNode, useEffect, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";

type ReorderListProps<T extends { id: string }> = {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T) => ReactNode;
};

/**
 * Drag-to-reorder built on framer-motion's Reorder, which is already a
 * dependency — no drag-and-drop library is added for this.
 *
 * The list is optimistic: the new order renders immediately on drop and the
 * server call happens after, so reordering never feels like it waits on a
 * round trip.
 */
export default function ReorderList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: ReorderListProps<T>) {
  const [order, setOrder] = useState(items);

  // Re-sync when the server sends a different set (add, delete, refresh).
  // Compared by id so a pure re-render doesn't clobber an in-flight drag.
  useEffect(() => {
    const incoming = items.map((item) => item.id).join(",");
    const current = order.map((item) => item.id).join(",");

    if (incoming !== current) {
      setOrder(items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <Reorder.Group
      axis="y"
      values={order}
      onReorder={setOrder}
      className="space-y-2"
    >
      {order.map((item) => (
        <ReorderRow
          key={item.id}
          item={item}
          onCommit={() =>
            onReorder(order.map((entry) => entry.id))
          }
        >
          {renderItem(item)}
        </ReorderRow>
      ))}
    </Reorder.Group>
  );
}

function ReorderRow<T extends { id: string }>({
  item,
  children,
  onCommit,
}: {
  item: T;
  children: ReactNode;
  onCommit: () => void;
}) {
  // Dragging is restricted to the handle so text inside a row stays
  // selectable and buttons remain clickable.
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onCommit}
      className="
        flex
        items-stretch
        gap-2
        rounded-[var(--radius)]
        border
        border-[var(--border)]
        bg-[var(--card)]
        shadow-[var(--shadow-panel)]
      "
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        onPointerDown={(e) => controls.start(e)}
        className="
          flex
          w-8
          shrink-0
          cursor-grab
          items-center
          justify-center
          rounded-l-[var(--radius)]
          text-[var(--text-subtle)]
          transition-colors
          duration-200
          hover:bg-[var(--surface-secondary)]
          hover:text-[var(--text-muted)]
          active:cursor-grabbing
        "
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.9} />
      </button>

      <div className="min-w-0 flex-1 py-3 pr-3">{children}</div>
    </Reorder.Item>
  );
}
