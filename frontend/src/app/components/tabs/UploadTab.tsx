import { uploadPDF, uploadText } from "../../services/documentService";
import { useState } from "react";

/**
 * Props interface for the UploadTab component
 */
interface UploadTabsProps {
	notes: string;
	setNotes: (notes: string) => void;
	file: File | null;
	setFile: (file: File | null) => void;
	handleReset: () => void;
	isLoading: boolean;
	setIsLoading: (loading: boolean) => void;
	showError: (error: string) => void;
	showSuccess: (message: string) => void;
	setActiveTab: (tab: string) => void;
}

/**
 * UploadTab component for uploading and processing study materials
 * Supports both text input and PDF file upload with automatic summary generation
 *
 * @param props - The component props containing upload state and handler functions
 * @returns JSX element containing the upload interface with mode selection and input areas
 */
export default function UploadTab({
	notes,
	setNotes,
	file,
	setFile,
	handleReset,
	isLoading,
	setIsLoading,
	showError,
	showSuccess,
}: UploadTabsProps) {
	const [uploadMode, setUploadMode] = useState<"text" | "pdf">("text");

	/**
	 * Uploads text content to the server
	 * Validates input and triggers summary generation on success
	 */
	const handleTextUpload = async () => {
		if (!notes.trim()) return;

		setIsLoading(true);

		try {
			await uploadText(notes);
			showSuccess("Text uploaded successfully! You can now generate summaries.");
			setIsLoading(false);
		} catch (e) {
			showError(e instanceof Error ? e.message : "text upload failed");
			setIsLoading(false);
		}
	};

	/**
	 * Uploads PDF file to the server
	 * Validates file selection and triggers summary generation on success
	 */
	const handlePDFUpload = async () => {
		if (!file) {
			return;
		}
		setIsLoading(true);

		try {
			const res = await uploadPDF(file);
			if (res.code === "200_OK") {
				// PDF uploaded successfully
				showSuccess(`PDF uploaded successfully! ${res.data?.pageCount || 0} pages processed.`);
				setIsLoading(false);
			}
		} catch (e) {
			showError(e instanceof Error ? e.message : "failure to upload PDF");
			setIsLoading(false);
		}
	};

	/**
	 * Routes the upload process based on the current upload mode
	 * Calls either text or PDF upload handler
	 */
	const handleNotesSubmit = async () => {
		if (uploadMode === "text") {
			await handleTextUpload();
		} else {
			await handlePDFUpload();
		}
	};

	/**
	 * Handles file input change events
	 * Updates the file state when a new PDF is selected
	 *
	 * @param e - The file input change event
	 */
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-2/3 mx-auto">
			<h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Upload Your Notes</h2>
			{/*Upload mode selection buttons */}
			<div className={"flex justify-center mb-6"}>
				<div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
					<button
						onClick={() => {
							setUploadMode("text");
						}}
						className={`px-6 py-2 rounded-md font-medium transition-all ${
							uploadMode === "text"
								? "bg-white dark:bg-gray-600 shadow-md"
								: "text-gray-600 dark:text-gray-300 cursor-pointer "
						}`}
					>
						Paste Text 📝
					</button>
					<button
						onClick={() => {
							setUploadMode("pdf");
						}}
						className={`px-6 py-2 rounded-md font-medium transition-all ${
							uploadMode === "pdf"
								? "bg-white dark:bg-gray-600 shadow-md"
								: "text-gray-600 dark:text-gray-300 cursor-pointer"
						}`}
					>
						Upload PDF 📄
					</button>
				</div>
			</div>

			<div className="space-y-6">
				{uploadMode === "text" ? (
					// Text input mode
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Paste your lecture notes, slides, or study material below:
						</label>
						<textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Paste your notes here... You can include lecture transcripts, slide content, textbook excerpts, or any study material you'd like to transform into learning resources."
							className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
						/>
						<div className="mt-2 text-sm text-gray-500 dark:text-gray-400">{notes.length} characters</div>
					</div>
				) : (
					// PDF input mode
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Upload a PDF document:
						</label>
						<div className="flex items-center justify-center w-full">
							<label className="flex items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
										<span className="font-semibold">Click to upload</span> or drag and drop
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">PDF files only</p>
								</div>
								<input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
							</label>
						</div>
						{/* Display selected file information */}
						{file && (
							<div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
								<div className="flex items-center gap-2">
									<span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
								</div>
							</div>
						)}
					</div>
				)}
				{/* Action buttons */}
				<div className="flex items-center justify-between gap-3">
					<button
						onClick={handleReset}
						className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
						disabled={isLoading}
					>
						Clear
					</button>
					<button
						onClick={handleNotesSubmit}
						disabled={isLoading}
						className="px-6 py-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 cursor-pointer"
					>
						{isLoading ? "Processing..." : "Generate Summary"}
					</button>
				</div>
			</div>
		</div>
	);
}
