import { useCallback, useEffect, useRef, useState } from "react";
import { LuStickyNote } from "react-icons/lu";
import { VscChevronRight } from "react-icons/vsc";
import { electronTrpc } from "renderer/lib/electron-trpc";

interface NotesPanelProps {
	workspaceId: string;
	onCollapse: () => void;
}

export function NotesPanel({ workspaceId, onCollapse }: NotesPanelProps) {
	const [content, setContent] = useState("");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { data, isLoading } = electronTrpc.notes.get.useQuery({ workspaceId });
	const setNoteMutation = electronTrpc.notes.set.useMutation();

	useEffect(() => {
		if (data?.content !== undefined) {
			setContent(data.content);
		}
	}, [data?.content]);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const newContent = e.target.value;
			setContent(newContent);

			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			debounceRef.current = setTimeout(() => {
				setNoteMutation.mutate({ workspaceId, content: newContent });
			}, 500);
		},
		[workspaceId, setNoteMutation],
	);

	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	return (
		<div className="h-full flex flex-col overflow-hidden border-t">
			<button
				type="button"
				onClick={onCollapse}
				className="flex items-center gap-1.5 px-2 py-1.5 text-left hover:bg-accent/30 cursor-pointer transition-colors shrink-0"
			>
				<VscChevronRight className="size-3 text-muted-foreground shrink-0 rotate-90 transition-transform duration-150" />
				<LuStickyNote className="size-3 text-muted-foreground shrink-0" />
				<span className="text-xs font-medium truncate">Notes</span>
			</button>
			<div className="flex-1 min-h-0 flex flex-col overflow-hidden">
				{isLoading ? (
					<div className="flex-1 flex items-center justify-center text-xs text-muted-foreground p-4">
						Loading...
					</div>
				) : (
					<textarea
						value={content}
						onChange={handleChange}
						placeholder="Jot down notes, reminders, reproduction steps..."
						spellCheck={false}
						className="flex-1 w-full h-full resize-none bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none font-mono overflow-y-auto"
					/>
				)}
			</div>
		</div>
	);
}
