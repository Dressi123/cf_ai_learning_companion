import type { Flashcard } from "../../../../workers/src/types/content";
import { useState } from "react";
import { FaRegLightbulb } from "react-icons/fa6";

/**
 * Props interface for the Flashcard component
 */
interface FlashcardProps {
	flashcard: Flashcard;
	score: { incorrect: Flashcard[]; correct: number };
	currentIndex: number;
	setScore: (score: { incorrect: Flashcard[]; correct: number }) => void;
	setCurrentIndex: (index: number) => void;
}

/**
 * Flashcard component that displays an interactive 3D flip card for studying
 * Features question/answer sides, hint functionality, and self-assessment rating
 *
 * @param props - The component props containing flashcard data and state handlers
 * @returns JSX element containing an animated flip card with question and answer sides
 */
export default function Flashcard({ flashcard, score, currentIndex, setScore, setCurrentIndex }: FlashcardProps) {
	const [showHint, setShowHint] = useState(false);
	const [rotationDegrees, setRotationDegrees] = useState(0);

	/**
	 * Handles the card flip animation by rotating 180 degrees
	 * Updates the rotation state to trigger CSS transform
	 */
	const handleFlip = () => {
		setRotationDegrees((prev) => prev + 180);
	};

	/**
	 * Handles user's self-assessment rating (correct/incorrect)
	 * Updates score, flips card back, and advances to next flashcard
	 *
	 * @param e - Mouse event to prevent event bubbling
	 * @param correct - Boolean indicating if the user got the answer correct
	 */
	const handleRating = (e: React.MouseEvent<HTMLButtonElement>, correct: boolean) => {
		e.stopPropagation();

		handleFlip(); // Flip back to question side
		setShowHint(false); // Hide hint for next card

		setTimeout(() => {
			setScore({
				incorrect: correct ? score.incorrect : [...score.incorrect, flashcard],
				correct: correct ? score.correct + 1 : score.correct,
			});
			setCurrentIndex(currentIndex + 1);
		}, 400); // Small delay to ensure rotation reset is applied first
	};

	return (
		<div className="w-xl h-96 outline-none perspective-[1000px]" onClick={handleFlip}>
			<div
				className={`relative size-full transition duration-500 transform-3d ease`}
				style={{ transform: `rotateX(${rotationDegrees}deg)` }}
			>
				{/* Front side - Question */}
				<div
					className="absolute inset-0 size-full backface-hidden bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border-l-4 border-blue-500
                                shadow-lg mb-4 hover:scale-[1.02] transition-transform cursor-pointer flex flex-col justify-around items-center"
				>
					<h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2 text-center ">
						{flashcard.id}. {flashcard.question}
					</h3>

					{/* Hint button with toggle functionality */}
					<button
						onClick={(e) => {
							e.stopPropagation(); // Prevent the flip when clicking the hint button
							setShowHint(!showHint);
						}}
					>
						{showHint ? (
							<div className="flex items-center font-semibold gap-2 py-2 px-4 bg-linear-to-r from-green-400/50 to-green-500/50 text-white rounded-lg cursor-pointer">
								{flashcard.hint}
							</div>
						) : (
							<div className="flex items-center font-semibold gap-2 py-2 px-4 opacity-70 bg-linear-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-100 hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105 cursor-pointer">
								<FaRegLightbulb className="" size={18} />
								Get a hint
							</div>
						)}
					</button>
				</div>

				{/* Back side - Answer and rating */}
				<div
					className="absolute inset-0 size-full backface-hidden rotate-x-180 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border-l-4 border-blue-500
                    text-white shadow-lg mb-4 hover:scale-[1.02] transition-transform cursor-pointer flex flex-col justify-around items-center"
				>
					<h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2 text-center">
						{flashcard.answer}
					</h3>
					<div className="flex flex-col items-center gap-4 font-semibold">
						{/* Self-assessment buttons */}
						<span className="text-gray-700 dark:text-gray-300">Did you get it right?</span>
						<div className="flex gap-4 w-96 justify-around">
							<button
								className="flex justify-center font-semibold gap-2 w-1/3 py-2 opacity-70 bg-linear-to-r 
                                from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-100 hover:from-purple-600 hover:to-pink-700 
                                transition-all transform hover:scale-105 cursor-pointer"
								onClick={(e) => handleRating(e, false)}
							>
								NO
							</button>
							<button
								className="flex justify-center font-semibold gap-2 w-1/3 py-2 opacity-70 bg-linear-to-r 
                                from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-100 hover:from-purple-600 hover:to-pink-700 
                                transition-all transform hover:scale-105 cursor-pointer"
								onClick={(e) => handleRating(e, true)}
							>
								YES
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
