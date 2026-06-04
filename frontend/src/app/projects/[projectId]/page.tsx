"use client";

import { useParams, notFound } from "next/navigation";
import { Layout } from "@/layouts/Layout";
import { useEffect, useState, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Project } from "@/types/project";
import { useProject, useUpdateProject } from "@/hooks/useProjects";
import Loading from "@/components/Loading";

import ProjectHeader from "@/components/project-detail/ProjectHeader";
import ProjectInfoSection from "@/components/project-detail/ProjectInfoSection";
import TerminSection from "@/components/project-detail/TerminSection";
import CBSSelectionSection from "@/components/project-detail/CBSSelectionSection";
import { toast } from "sonner";
import AdendumSection from "@/components/project-detail/AdendumSection";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: project, isLoading } = useProject(projectId);

  const { mutate: updateProject } = useUpdateProject(projectId);

  const [isEditingProject, setIsEditingProject] = useState(false);

  const methods = useForm<Project>({
    mode: "onBlur",
  });

  const { reset, handleSubmit, watch } = methods;

  const watchedTermins = watch("termin");
  const currentBudget = watch("budget") || 0;

  const totalTerminNominal = (watchedTermins || []).reduce(
    (acc, curr) => acc + (Number(curr.nominal) || 0),
    0
  );
  const remainingBudget = currentBudget - totalTerminNominal;

  const handleResetForm = useCallback(() => {
    if (project) {
      const rawTermin = project.termin || [];

      const termin = rawTermin.filter(
        (t) => t.category === "termin" || !t.category
      );
      const adendum = rawTermin.filter((t) => t.category === "adendum");

      reset({
        ...project,
        termin,
        adendum,
      });
    }
  }, [project, reset]);

  useEffect(() => {
    handleResetForm();
  }, [handleResetForm]);

  function onSaveProject(data: Project) {
    if (remainingBudget !== 0) {
      toast.error("Total nominal termin harus sama dengan budget!");
      return;
    }

    const allTermins = [...(data.termin || []), ...(data.adendum || [])];

    updateProject(
      {
        data: {
          name: data.name,
          description: data.description,
          location: data.location,
          budget: Number(data.budget),
          start_date: data.start_date,
          end_date: data.end_date,
          status: data.status,
          termin: allTermins,
        },
      },
      {
        onSuccess: () => {
          setIsEditingProject(false);
        },
      }
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!project) {
    return notFound();
  }

  return (
    <Layout>
      <div className="space-y-8">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSaveProject)} className="space-y-8">
            <ProjectHeader
              project={project}
              isEditing={isEditingProject}
              onEditToggle={setIsEditingProject}
              onCancel={handleResetForm}
            />

            <ProjectInfoSection
              project={project}
              isEditing={isEditingProject}
            />

            <TerminSection
              isEditing={isEditingProject}
              currentBudget={currentBudget}
            />

            <AdendumSection isEditingProject={isEditingProject} />
          </form>
        </FormProvider>

        <CBSSelectionSection projectId={projectId} project={project} />
      </div>
    </Layout>
  );
}
