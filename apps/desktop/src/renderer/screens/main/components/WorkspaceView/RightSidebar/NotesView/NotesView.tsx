import { useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { electronTrpc } from "renderer/lib/electron-trpc";

export function NotesView() {
	const { workspaceId } = useParams({ strict: false });
	const [content, setContent] = useState("");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { data, isLoading } = electronTrpc.notes.get.useQuery(
		{ workspaceId: workspaceId ?? "" },
		{ enabled: !!workspaceId },
	);

	const setNoteMutation = electronTrpc.notes.set.useMutation();

	// Sync fetched data into local state
	useEffect(() => {
		if (data?.content !== undefined) {
			setContent(data.content);
		}
	}, [data?.content]);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const newContent = e.target.value;
			setContent(newContent);

			if (!workspaceId) return;

			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			debounceRef.current = setTimeout(() => {
				setNoteMutation.mutate({
					workspaceId,
					content: newContent,
				});
			}, 500);
		},
		[workspaceId, setNoteMutation],
	);

	// Flush pending saves on unmount
	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	if (!workspaceId) {
		return (
			<div className="flex-1 flex items-center justify-center text-xs text-muted-foreground p-4">
				Select a workspace to view notes.
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center text-xs text-muted-foreground p-4">
				Loading...
			</div>
		);
	}

	return (
		<textarea
			value={content}
			onChange={handleChange}
			placeholder="Jot down notes, reminders, reproduction steps..."
			spellCheck={false}
			className="flex-1 w-full h-full resize-none bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none font-mono overflow-y-auto"
		/>
	);
}
