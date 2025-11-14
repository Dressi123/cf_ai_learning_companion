"use client";

import { getFlashcards } from "../../services/contentGenerationService";
import { Flashcard as FlashcardType } from "../../../../../workers/src/types/content";
import { useState } from "react";
import Flashcard from "../../components/Flashcard";

/**
 * Props interface for the FlashcardTab component
 */
interface FlashcardTabProps {
	flashcards: FlashcardType[] | null;
	handleReset: () => void;
	setFlashcards: (flashcards: FlashcardType[]) => void;
	showError: (error: string) => void;
	showSuccess: (message: string) => void;
	setActiveTab: (tab: string) => void;
}

/**
 * FlashcardTab component for displaying and managing AI-generated flashcards
 * Provides functionality to generate, study, and track progress through flashcards
 *
 * @param props - The component props
 * @returns JSX element containing the flashcard interface
 */
export default function FlashcardTab({
	flashcards,
	setFlashcards,
	showError,
	showSuccess,
	setActiveTab,
}: FlashcardTabProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [score, setScore] = useState<{ incorrect: FlashcardType[]; correct: number }>({ incorrect: [], correct: 0 });
	const [currentIndex, setCurrentIndex] = useState(0);
	const [currentFlashcards, setCurrentFlashcards] = useState<FlashcardType[] | null>(flashcards);

	/**
	 * Generates new flashcards from the uploaded document
	 * Sets loading state and handles errors during generation
	 */
	const handleGenerateFlashcards = async () => {
		setIsLoading(true);
		setActiveTab("Flashcards");

		try {
			const result = await getFlashcards();
			setFlashcards(result.data?.flashcards ?? []);
			setCurrentFlashcards(result.data?.flashcards ?? []);
		} catch (e) {
			showError(e instanceof Error ? e.message : "failed to generate flashcards");
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Resets the flashcard session to the original set
	 * Clears score and resets current index to beginning
	 */
	const handleResetFlashcards = () => {
		setScore({ incorrect: [], correct: 0 });
		setCurrentFlashcards(flashcards);
		setCurrentIndex(0);
	};

	/**
	 * Starts a focused study session with only the incorrectly answered flashcards
	 * Resets score and index for the learning session
	 */
	const handleLearningCards = () => {
		if (!currentFlashcards) return;
		setCurrentFlashcards(score.incorrect);
		setScore({ incorrect: [], correct: 0 });
		setCurrentIndex(0);
	};

	/**
	 * Regenerates flashcards by forcing a new generation from the API
	 * Bypasses any cached flashcards and creates fresh content
	 */
	const handleRegenerate = async () => {
		setIsLoading(true);

		try {
			const result = await getFlashcards(true); // Pass force=true
			if (result && result.data) {
				setFlashcards(result.data.flashcards);
				setCurrentFlashcards(result.data.flashcards);
				setScore({ incorrect: [], correct: 0 });
				setCurrentIndex(0);
				showSuccess("Flashcards regenerated successfully!");
			}
		} catch (e) {
			showError(e instanceof Error ? e.message : "Failed to regenerate flashcards");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mx-auto w-2/3 ">
			<div className="flex items-center justify-between gap-2 mb-6">
				<h2 className="text-2xl font-semibold text-gray-800 dark:text-white">AI-Generated Flashcards</h2>
				<button
					onClick={handleRegenerate}
					disabled={isLoading}
					className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Regenerate
				</button>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
					<span className="ml-4 text-gray-600 dark:text-gray-300">Loading ...</span>
				</div>
			) : currentFlashcards ? (
				<div className="flex flex-col items-center justify-center">
					{/* Score board */}
					<div className="grid grid-cols-3 w-xl items-center mb-4 text-center text-gray-700 dark:text-gray-300 font-semibold text-sm">
						<div className="flex gap-2 text-orange-400 items-center justify-start">
							<div className="px-3 border-orange-400 border rounded-full text-sm leading-6">
								{score.incorrect.length}
							</div>
							Still Learning
						</div>
						{/* Progress indicator - centered */}
						<div className="text-sm text-gray-600 dark:text-gray-400">
							Card {currentIndex + 1 <= currentFlashcards.length ? currentIndex + 1 : currentIndex} of{" "}
							{currentFlashcards.length}
						</div>
						<div className="flex gap-2 text-green-400 items-center justify-end">
							Mastered
							<div className="px-3 border-green-400 border rounded-full text-sm leading-6">
								{score.correct}
							</div>
						</div>
					</div>

					{/* Current Flashcard */}
					{currentIndex < currentFlashcards.length ? (
						<Flashcard
							flashcard={currentFlashcards[currentIndex]}
							score={score}
							setScore={setScore}
							currentIndex={currentIndex}
							setCurrentIndex={setCurrentIndex}
						/>
					) : (
						/* Finished all flashcards screen */
						<div className="w-full text-center py-12 gap-4 flex flex-col items-center justify-center">
							<p className="text-gray-500 dark:text-gray-400">
								You&apos;ve completed all flashcards! Great job! 🎉
							</p>
							<div className="flex gap-8 w-1/2 justify-center">
								<button
									className="mt-4 w-1/2 py-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg 
                                        hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all 
                                        transform hover:scale-105 cursor-pointer disabled:hover:from-blue-500 disabled:hover:to-indigo-600 disabled:hover:scale-100"
									onClick={handleLearningCards}
									disabled={score.incorrect.length === 0}
								>
									Focus on {score.incorrect.length} learning cards
								</button>
								<button
									className="mt-4 w-1/2 py-2 bg-linear-to-r from-purple-500 to-pink-600 text-white rounded-lg
                                        hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all 
                                        transform hover:scale-105 cursor-pointer"
									onClick={handleResetFlashcards}
								>
									Restart Flashcards
								</button>
							</div>
						</div>
					)}
				</div>
			) : (
				/* No flashcards available */
				<div className="text-center py-12 gap-4 flex flex-col items-center justify-center">
					<p className="text-gray-500 dark:text-gray-400">No flashcards available.</p>
					<button
						onClick={handleGenerateFlashcards}
						disabled={isLoading}
						className="px-6 py-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 cursor-pointer"
					>
						{isLoading ? "Processing..." : "Generate Flashcards"}
					</button>
				</div>
			)}
		</div>
	);
}
