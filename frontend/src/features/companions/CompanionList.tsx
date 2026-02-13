"use client";

import { useEffect, useRef } from "react";
import { useCompanions } from "@/queries/companions";
import CompanionCard from "./CompanionCard";

export default function CompanionList() {
  const { data, isLoading, error } = useCompanions();
  const companions = data || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-muted rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load companions</p>
        <p className="text-sm text-muted-foreground mt-2">
          Make sure your backend is running on port 9000
        </p>
      </div>
    );
  }

  if (companions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No companions available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {companions.map((companion, index) => (
        <CompanionCard key={companion.id} companion={companion} index={index} />
      ))}
    </div>
  );
}
