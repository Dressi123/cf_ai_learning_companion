"use client";

import { RefObject, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { FaCode, FaPen } from "react-icons/fa6";
import { MdFormatIndentIncrease, MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { RiResetLeftFill } from "react-icons/ri";
import Tooltip from "../Tooltip";
import ConfirmationModal from "../ConfirmationModal";
import KeyboardShortcut from "../KeyboardShortcut";

interface CodeEditorPanelProps {
	code: string;
	setCode: (code: string) => void;
	isSelected: boolean;
	onSelect: () => void;
	editorContainerRef: RefObject<HTMLDivElement | null>;
	handleEditorWillMount: (monaco: Monaco) => void;
	handleEditorDidMount: (editor: editor.IStandaloneCodeEditor) => void;
	formatCode: () => void;
	starterCode: string;
}

export default function CodeEditorPanel({
	code,
	setCode,
	isSelected,
	onSelect,
	editorContainerRef,
	handleEditorWillMount,
	handleEditorDidMount,
	formatCode,
	starterCode,
}: CodeEditorPanelProps) {
	const [showResetModal, setShowResetModal] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null);
	const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);

	// Listen for fullscreen changes
	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
	}, []);

	// Add keybinding to Monaco editor
	useEffect(() => {
		if (editorInstance && monacoInstance) {
			editorInstance.addAction({
				id: "format-code",
				label: "Format Code",
				keybindings: [
					monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyF,
				],
				run: () => {
					formatCode();
				},
			});
		}
	}, [editorInstance, monacoInstance, formatCode]);

	const handleReset = () => {
		// Only show modal if code has changed
		if (code !== starterCode) {
			setShowResetModal(true);
		} else {
			// If code hasn't changed, just reset anyway (no-op but consistent)
			setCode(starterCode);
		}
	};

	const confirmReset = () => {
		setCode(starterCode);
	};

	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			editorContainerRef.current?.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	};

	const handleEditorWillMountWrapper = (monaco: Monaco) => {
		setMonacoInstance(monaco);
		handleEditorWillMount(monaco);
	};

	const handleEditorDidMountWrapper = (editor: editor.IStandaloneCodeEditor) => {
		setEditorInstance(editor);
		handleEditorDidMount(editor);
	};

	return (
		<div
			onClick={onSelect}
			className={`flex flex-col h-full bg-[#333333] rounded ${
				isSelected ? "border border-[#606060]" : "border border-transparent"
			}`}
		>
			<div className="flex items-center px-1 py-1">
				<span className="text-gray-300 text-sm font-bold flex items-center py-1 px-2 rounded hover:bg-[#434343] cursor-pointer">
					<FaCode className="text-blue-500 mr-1" /> Code
				</span>
			</div>

			<div className="flex items-center justify-between px-1 py-1 text-xs bg-[#262626] border-b border-[#444444]">
				<div className="flex">
					<span className="text-[#B1B1B1] font-bold px-2 cursor-pointer hover:bg-[#333333] rounded flex items-center">
						Java
					</span>
					<span className="text-[#B1B1B1] font-bold px-2 cursor-pointer flex items-center hover:bg-[#333333] rounded">
						<FaPen className="mr-1 text-[10px]" /> Autocomplete
					</span>
				</div>
				<div className="flex">
					<Tooltip
						text={
							<span className="flex items-center gap-2">
								Format Code <KeyboardShortcut keys={["⌥", "⇧", "F"]} />
							</span>
						}
					>
						<button
							type="button"
							onClick={formatCode}
							className="text-[#B1B1B1] font-bold px-2 cursor-pointer flex items-center hover:bg-[#333333] rounded"
						>
							<MdFormatIndentIncrease className="text-sm my-[1px]" />
						</button>
					</Tooltip>
					<Tooltip text="Reset to Original Code" position="top-left">
						<button
							type="button"
							onClick={handleReset}
							className="text-[#B1B1B1] font-bold px-2 cursor-pointer flex items-center hover:bg-[#333333] rounded"
						>
							<RiResetLeftFill className="text-sm my-[1px]" />
						</button>
					</Tooltip>
					<Tooltip text="Toggle Fullscreen" position="top-left">
						<button
							type="button"
							onClick={toggleFullscreen}
							className="text-[#B1B1B1] font-bold px-2 cursor-pointer flex items-center hover:bg-[#333333] rounded"
						>
							{isFullscreen ? (
								<MdFullscreenExit className="text-sm my-[1px]" />
							) : (
								<MdFullscreen className="text-sm my-[1px]" />
							)}
						</button>
					</Tooltip>
				</div>
			</div>

			<div ref={editorContainerRef} className="flex-1 min-h-0 no-monaco-sticky">
				<Editor
					height="100%"
					defaultLanguage="java"
					value={code}
					onChange={(v) => setCode(v || "")}
					theme="leetcode"
					beforeMount={handleEditorWillMountWrapper}
					onMount={handleEditorDidMountWrapper}
					options={{
						minimap: { enabled: false },
						fontSize: 12,
						lineNumbers: "on",
						scrollBeyondLastLine: false,
						automaticLayout: false,
						formatOnPaste: true,
						scrollbar: { useShadows: false },
					}}
				/>
			</div>

			<ConfirmationModal
				isOpen={showResetModal}
				onClose={() => setShowResetModal(false)}
				onConfirm={confirmReset}
				title="Are you sure?"
				message="Your current code will be discarded and reset to the default code!"
			/>
		</div>
	);
}
