import type { Request, RequestHandler, Response } from "express";
import { commonValidations } from "../../common/utils/commonValidation";
import type { CreateProjectDTO, GetProjectParam } from "./projectDTO";
import { projectService } from "./projectService";

export class ProjectController {
	public getUserProjects: RequestHandler = async (req, res) => {
		const id = req.userId;

		const parseId = commonValidations.id.safeParse(id);

		if (!parseId.success) {
			return res.status(400).json({
				message: "Invalid user id",
				errors: parseId.error.format(),
			});
		}

		const projects = await projectService.findAllUserProject(id);
		res.status(projects.statusCode).json(projects);
	};

	public getDetailProject: RequestHandler<GetProjectParam> = async (req, res) => {
		const id = req.userId;

		const parseId = commonValidations.id.safeParse(id);

		if (!parseId.success) {
			return res.status(400).json({
				message: "Invalid user id",
				errors: parseId.error.format(),
			});
		}

		const projectId = req.params.id;

		const projects = await projectService.getUserDetailProject(projectId);
		res.status(projects.statusCode).json(projects);
	};

	public deleteProject: RequestHandler = async (req: Request, res: Response) => {
		const projectId = req.params.id as string;

		const parseId = commonValidations.id.safeParse(projectId);
		if (!parseId.success) {
			return res.status(400).json({
				message: "Invalid project id",
				errors: parseId.error.format(),
			});
		}

		const serviceResponse = await projectService.deleteProject(projectId);

		return res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public updateProject: RequestHandler = async (req: Request, res: Response) => {
		const projectId = req.params.id as string;

		const parseId = commonValidations.id.safeParse(projectId);
		if (!parseId.success) {
			return res.status(400).json({
				message: "Invalid project id",
				errors: parseId.error.format(),
			});
		}

		const serviceResponse = await projectService.updateProject(req.body, projectId);

		return res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public createProject: RequestHandler = async (req: Request<unknown, unknown, CreateProjectDTO>, res) => {
		const id = req.userId;

		const parseId = commonValidations.id.safeParse(id);

		if (!parseId.success) {
			return res.status(400).json({
				message: "Invalid user id",
				errors: parseId.error.format(),
			});
		}

		const project = await projectService.createProject(req.body, id);
		res.status(project.statusCode).json(project);
	};
}

export const projectController = new ProjectController();
