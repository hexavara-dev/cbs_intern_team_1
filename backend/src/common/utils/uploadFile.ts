import fs from "fs";
import path from "path";
import multer from "multer";
import { env } from "./envConfig";

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	const allowed = ["image/jpeg", "image/png"];

	if (!allowed.includes(file.mimetype)) {
		return cb(new Error("Only JPG and PNG files are allowed"));
	}

	cb(null, true);
};

export const fileUploader = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 },
	fileFilter,
});

export async function uploadFile(
	file: Express.Multer.File,
	folder: string,
): Promise<{ path: string; publicUrl: string }> {
	const fileName = `${Date.now()}-${file.originalname}`;
	const folderPath = path.join(process.cwd(), folder);
	const filePath = path.join(folderPath, fileName);

	fs.mkdirSync(folderPath, { recursive: true });
	fs.writeFileSync(filePath, file.buffer);

	const relativePath = `${folder}/${fileName}`;

	return {
		path: relativePath,
		publicUrl: `${env.APP_URL}/${relativePath}`,
	};
}

export async function deleteFile(filePath: string) {
	const fullPath = path.join(process.cwd(), filePath);
	if (fs.existsSync(fullPath)) {
		fs.unlinkSync(fullPath);
	}
}
