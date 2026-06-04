"use client";

import { useParams } from "next/navigation";
import { Layout } from "@/layouts/Layout";
import BackButton from "@/components/ui/back-button";
import { WBSCostDetailSection } from "@/components/cost-monitoring-report/WBSCostDetailSection";

export default function WBSCostDetailPage() {
  const { projectId, wbsId } = useParams() as {
    projectId: string;
    wbsId: string;
  };

  return (
    <Layout>
      <div className="space-y-8">
        <BackButton />
        <WBSCostDetailSection projectId={projectId} wbsId={wbsId} mode="page" />
      </div>
    </Layout>
  );
}
