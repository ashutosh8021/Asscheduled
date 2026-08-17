"use client";

import { useSearchParams } from "next/navigation";
import Form7A from "@/components/form7a/Form7A";

export default function ApplyClient() {
  const params = useSearchParams();
  const trip = params.get("trip") ?? undefined;
  return <Form7A preselect={trip} />;
}
