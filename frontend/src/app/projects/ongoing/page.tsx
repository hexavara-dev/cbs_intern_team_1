"use client";

import { Layout } from "@/layouts/Layout";
import ProjectSummary from "@/components/projects/ProjectSummary";
import ProjectTable from "@/components/projects/ProjectTable";
import Typography from "@/components/Typography";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import Loading from "@/components/Loading";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function OngoingProjectsPage() {
  const { data, isLoading } = useProjects();
  const projects = data?.data;

  if (isLoading) return <Loading />;
  if (!projects || projects.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col">
            <Typography variant="title" weight="bold">
              Ongoing Projects
            </Typography>
            <Typography variant="body" className="text-muted-foreground">
              Project yang sedang berjalan
            </Typography>
          </div>
          <EmptyState
            title="Data Proyek Tidak Ditemukan."
            description="Silahkan membuat proyek baru untuk track progress dan cost proyek Anda."
            icon={Plus}
            action={
              <Link href="/projects/ongoing/new-project">
                <Button>Create New Project</Button>
              </Link>
            }
          />
        </div>
      </Layout>
    );
  }

  const ongoingProjects = projects?.filter((p) =>
    ["ongoing", "maintenance", "hold"].includes(p.status)
  );

  // Stats calculation
  const totalBudget = projects?.reduce((sum, p) => sum + Number(p.budget), 0);
  const ongoingCount = projects?.filter((p) => p.status === "ongoing").length;
  const completedCount = projects?.filter((p) => p.status === "finish").length;

  // TODO: GET DATA VIA BACKEND
  // const projectExceedData = ongoingProjects
  //   .map((p) => {
  //     const records = getRecordsByProject(p.id);
  //     const totalActualCost = records.reduce(
  //       (sum, r) => sum + r.total_amount,
  //       0
  //     );
  //     return { ...p, totalActualCost };
  //   })
  //   .filter((p) => p.totalActualCost > p.budget);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col">
          <Typography variant="title" weight="bold">
            Ongoing Projects
          </Typography>
          <Typography variant="body" className="text-muted-foreground">
            Project yang Sedang Berjalan
          </Typography>
        </div>

        {/* TODO: GET DATA VIA BACKEND */}
        {/* {projectExceedData.length > 0 && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">
              Budget Limit Exceeded
            </AlertTitle>
            <AlertDescription className="text-red-700">
              The following projects have exceeded their budget limits:
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {projectExceedData.map((p) => (
                  <li key={p.id}>
                    <span className="font-semibold">{p.name}</span>: Budget{" "}
                    {formatCurrency(p.budget)} vs Actual{" "}
                    {formatCurrency(p.totalActualCost)}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )} */}

        <ProjectSummary
          totalProjects={projects.length}
          totalBudget={totalBudget}
          ongoingCount={ongoingCount}
          completedCount={completedCount}
        />

        <div className="flex w-full justify-start md:justify-end">
          <Link href="/projects/ongoing/new-project">
            <Button leftIcon={Plus}>Create New Project</Button>
          </Link>
        </div>

        <ProjectTable projects={ongoingProjects} />
      </div>
    </Layout>
  );
}
