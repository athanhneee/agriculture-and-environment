import { notFound } from "next/navigation";
import { Metadata } from "next";

import { getFarmZoneById } from "@/lib/farm-zones-server";
import { FarmZoneForm } from "@/components/forms/FarmZoneForm";

export const metadata: Metadata = {
  title: "Cập nhật Vùng Trồng | Smart Farm Monitoring System",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditZonePage({ params }: PageProps) {
  const { id } = await params;
  const zone = await getFarmZoneById(id);

  if (!zone) {
    notFound();
  }

  return (
    <div className="flex w-full items-center justify-center p-4">
      <FarmZoneForm initialData={zone} />
    </div>
  );
}
