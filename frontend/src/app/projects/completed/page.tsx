"use client";

import { Layout } from "@/layouts/Layout";
import ProjectSummary from "@/components/projects/ProjectSummary";
import ProjectTable from "@/components/projects/ProjectTable";
import Typography from "@/components/Typography";
import { useProjects } from "@/hooks/useProjects";
import Loading from "@/components/Loading";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function CompletedProjectsPage() {
  const { data, isLoading } = useProjects();
  const projects = data?.data;

  if (isLoading) return <Loading />;

  const completedProjects = projects?.filter((p) =>
    ["finish", "closed", "canceled"].includes(p.status)
  );

  // Stats calculation
  const totalBudget = projects?.reduce((sum, p) => sum + Number(p.budget), 0);
  const ongoingCount = projects?.filter((p) => p.status === "ongoing").length;
  const completedCount = projects?.filter((p) => p.status === "finish").length;

  if (!completedProjects || completedProjects.length === 0) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <Typography variant="title" weight="bold">
              Completed Projects
            </Typography>
            <Typography variant="body" className="text-muted-foreground">
              Project yang Sudah Selesai
            </Typography>
          </div>
          <EmptyState
            title="Tidak Ada Proyek Selesai"
            description="Anda belum memiliki proyek yang telah diselesaikan. Silakan cek proyek yang sedang berjalan."
            icon={CheckCircle2}
            action={
              <Link href="/projects/ongoing">
                <Button className="gap-2">
                  Lihat Proyek Berjalan
                  <ArrowRight size={16} />
                </Button>
              </Link>
            }
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <Typography variant="title" weight="bold">
            Completed Projects
          </Typography>
          <Typography variant="body" className="text-muted-foreground">
            Review and analyze your finished projects
          </Typography>
        </div>

        <ProjectSummary
          totalProjects={projects?.length || 0}
          totalBudget={totalBudget || 0}
          ongoingCount={ongoingCount || 0}
          completedCount={completedCount || 0}
        />

        <ProjectTable projects={completedProjects} />
      </div>
    </Layout>
  );
}
