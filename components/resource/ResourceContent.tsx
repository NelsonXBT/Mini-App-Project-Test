"use client";

import { useState } from "react";

import ResourceTabs from "./ResourceTabs";
import ResourceCard from "./ResourceCard";

import { featuredResources } from "@/lib/constants/featured-resources";
import { featuredTools } from "@/lib/constants/featured-tools";

export default function ResourceContent() {
  const [activeTab, setActiveTab] = useState<
    "packs" | "tools"
  >("tools");

  return (
    <>
      <ResourceTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="space-y-2.5">
        {activeTab === "packs"
          ? featuredResources.map((pack) => (
              <ResourceCard
                key={pack.id}
                icon={pack.icon}
                title={pack.title}
                description={pack.description}
                badge={`${pack.files} Files`}
              />
            ))
          : featuredTools.map((tool) => (
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