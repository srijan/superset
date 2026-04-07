import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { SUPERSET_DIR_NAME } from "shared/constants";
import { z } from "zod";
import { publicProcedure, router } from "..";

const NOTES_FILE_NAME = "workspace-notes.json";

function getNotesFilePath(): string {
	return join(homedir(), SUPERSET_DIR_NAME, NOTES_FILE_NAME);
}

function readNotesFile(): Record<string, string> {
	const filePath = getNotesFilePath();
	if (!existsSync(filePath)) {
		return {};
	}
	try {
		const content = readFileSync(filePath, "utf-8");
		return JSON.parse(content);
	} catch {
		return {};
	}
}

function writeNotesFile(notes: Record<string, string>): void {
	const filePath = getNotesFilePath();
	const dir = join(homedir(), SUPERSET_DIR_NAME);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	writeFileSync(filePath, JSON.stringify(notes, null, 2), "utf-8");
}

export const createNotesRouter = () => {
	return router({
		get: publicProcedure
			.input(z.object({ workspaceId: z.string() }))
			.query(({ input }) => {
				const notes = readNotesFile();
				return { content: notes[input.workspaceId] ?? "" };
			}),

		set: publicProcedure
			.input(
				z.object({
					workspaceId: z.string(),
					content: z.string(),
				}),
			)
			.mutation(({ input }) => {
				const notes = readNotesFile();
				if (input.content.trim() === "") {
					delete notes[input.workspaceId];
				} else {
					notes[input.workspaceId] = input.content;
				}
				writeNotesFile(notes);
				return { success: true };
			}),
	});
};

export type NotesRouter = ReturnType<typeof createNotesRouter>;
