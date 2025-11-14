"use client";

import Toast from "./components/ErrorToast";
import FlashcardTab from "./components/tabs/FlashcardTab";
import QuizTab from "./components/tabs/QuizTab";
import SummaryTab from "./components/tabs/SummaryTab";
import Tabs from "./components/tabs/Tabs";
import UploadTab from "./components/tabs/UploadTab";
import { Flashcard, Summary, Question } from "../../../workers/src/types/content";
import { useState } from "react";

/**
 * Toast message interface
 */
interface ToastMessage {
	text: string;
	type: "success" | "error";
}

/**
 * Home component - Main page of the AI Learning Companion application
 * Manages all application state and renders different tabs for document processing,
 * summary generation, and flashcard studying
 *
 * @returns JSX element containing the complete application interface
 */
export default function Home() {
	const [notes, setNotes] = useState("");
	const [summary, setSummary] = useState<Summary | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
	const [quizzes, setQuizzes] = useState<Question[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("Upload");
	const [toast, setToast] = useState<ToastMessage | null>(null);

	const tabs = ["Upload", "Summary", "Flashcards", "Quiz"];

	/**
	 * Resets all application state to initial values
	 * Clears uploaded content, generated data, and returns to upload tab
	 */
	const handleReset = () => {
		setNotes("");
		setFile(null);
		setSummary(null);
		setActiveTab("Upload");
		setFlashcards(null);
		setToast(null);
	};

	/**
	 * Helper function to show error messages
	 */
	const showError = (message: string) => {
		setToast({ text: message, type: "error" });
	};

	/**
	 * Helper function to show success messages
	 */
	const showSuccess = (message: string) => {
		setToast({ text: message, type: "success" });
	};

	return (
		<div className="font-sans items-center justify-items-center min-h-screen p-8 gap-16 w-full">
			{/* Toast notification */}
			{toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}

			{/* Header */}
			<div className="container mx-auto px-4">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold text-gray-800 dark:text-white">AI Learning Companion</h2>
				</div>
			</div>

			{/* Tabs for navigation */}
			<Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

			{/* Main content area */}
			<div className="mx-auto w-full">
				{/* Upload Tab */}
				{activeTab === "Upload" && (
					<UploadTab
						notes={notes}
						setNotes={setNotes}
						file={file}
						setFile={setFile}
						handleReset={handleReset}
						isLoading={isLoading}
						showError={showError}
						showSuccess={showSuccess}
						setIsLoading={setIsLoading}
						setActiveTab={setActiveTab}
					/>
				)}

				{/* Summary Tab */}
				{activeTab === "Summary" && (
					<SummaryTab
						summary={summary}
						isLoading={isLoading}
						setSummary={setSummary}
						setIsLoading={setIsLoading}
						showError={showError}
						showSuccess={showSuccess}
						setActiveTab={setActiveTab}
					/>
				)}

				{/* Flashcards Tab */}
				{activeTab === "Flashcards" && (
					<FlashcardTab
						flashcards={flashcards}
						handleReset={handleReset}
						setFlashcards={setFlashcards}
						showError={showError}
						showSuccess={showSuccess}
						setActiveTab={setActiveTab}
					/>
				)}

				{/* Quiz Tab */}
				{activeTab === "Quiz" && (
					<QuizTab
						quizzes={quizzes}
						showError={showError}
						showSuccess={showSuccess}
						setActiveTab={setActiveTab}
						setQuizzes={setQuizzes}
					/>
				)}
			</div>
		</div>
	);
}
