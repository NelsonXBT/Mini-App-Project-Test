"use client";

import { useState } from "react";

import ResourceTabs from "./ResourceTabs";
import ResourceCard from "./ResourceCard";

import {
  resourcePacks,
  resourceTools,
} from "@/lib/data";

export default function ResourceContent() {
  const [activeTab, setActiveTab] = useState<
    "packs" | "tools"
  >("packs");

  return (
    <>
      <ResourceTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="space-y-3">
        {activeTab === "packs"
          ? resourcePacks.map((pack) => (
              <ResourceCard
                key={pack.id}
                icon={pack.icon}
                title={pack.title}
                description={pack.description}
                badge={`${pack.files} Files`}
              />
            ))
          : resourceTools.map((tool) => (
              <ResourceCard
                key={tool.id}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                badge="Affiliate"
              />
            ))}
      </div>
    </>
  );
}