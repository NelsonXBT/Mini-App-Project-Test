"use client";

import { useState } from "react";

import ResourceTabs from "./ResourceTabs";
import ResourceCard from "./ResourceCard";

import type { ResourceItemView } from "@/lib/db/resources";

type ResourceContentProps = {
  packs: ResourceItemView[];
  tools: ResourceItemView[];
};

export default function ResourceContent({
  packs,
  tools,
}: ResourceContentProps) {
  const [activeTab, setActiveTab] = useState<"packs" | "tools">("tools");

  /*
   * The Packs tab was hard-locked in code. It now locks itself whenever
   * nothing is published in that section, so an admin publishing the first
   * pack opens the tab without a code change — and unpublishing them all
   * closes it again rather than leaving an empty tab.
   */
  const packsLocked = packs.length === 0;

  const items = activeTab === "packs" && !packsLocked ? packs : tools;

  return (
    <>
      <ResourceTabs
        activeTab={packsLocked ? "tools" : activeTab}
        onTabChange={setActiveTab}
        packsLocked={packsLocked}
      />

      <div className="space-y-2.5">
        {items.map((item) => (
          <ResourceCard
            key={item.id}
            icon={item.icon}
            title={item.title}
            description={item.description}
            meta={item.meta}
            cta={item.cta}
            external={item.section === "tools"}
            href={item.url || undefined}
          />
        ))}
      </div>
    </>
  );
}
