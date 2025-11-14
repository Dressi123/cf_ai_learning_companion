import { Question } from "../../../../workers/src/types/content";
import MarkdownRenderer from "./MarkdownRenderer";

/**
 * Props interface for the Quiz component
 */
interface QuizProps {
	quiz: Question;
	onAnswer: (isCorrect: boolean) => void;
	isAnswered?: boolean;
}

/**
 * Quiz component that displays an interactive quiz question with multiple choice options.
 * Shows feedback and explanations after the user selects an answer.
 *
 * @param props - The component props
 * @returns A rendered quiz component
 */
export default function Quiz({ quiz, onAnswer, isAnswered = false }: QuizProps) {
	/**
	 * Handles the click event when a user selects an option.
	 * Prevents multiple answers by checking if the quiz has already been answered.
	 */
	const handleOptionClick = (optionId: number) => {
		const isCorrect = optionId === quiz.answerId;
		onAnswer(isCorrect);
	};

	return (
		<div className="w-3xl min-h-96 mx-auto flex flex-col justify-between bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border-l-4 border-blue-500">
			<div className="text-2xl flex gap-2 font-semibold text-gray-800 dark:text-white py-4 text-center">
				<span>{quiz.id}.</span>
				<MarkdownRenderer content={quiz.question} />
			</div>
			<div className={`flex flex-col gap-2 ${isAnswered && "gap-4"}`}>
				{quiz.answerOptions.map((option) => (
					<button
						type="button"
						disabled={isAnswered}
						key={option.id}
						className={`shadow-xl flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600
                        ${!isAnswered && "hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"}
                        ${isAnswered && "cursor-not-allowed opacity-90"}
                        transition-all
                        ${
							isAnswered &&
							(option.id === quiz.answerId
								? "ring-2 ring-green-300 dark:ring-green-500"
								: "ring-2 ring-red-300 dark:ring-red-700")
						}`}
						onClick={() => handleOptionClick(option.id)}
					>
						<div className="flex gap-2 font-semibold">
							<span>{option.id}. </span>
							<span>{option.option}</span>
						</div>
						{isAnswered && (
							<div className="flex flex-col transition-all text-left ">
								<span
									className={`font-semibold ${
										option.id === quiz.answerId
											? "text-green-500 dark:text-green-300"
											: "text-red-800 dark:text-red-200"
									}`}
								>
									{option.id === quiz.answerId ? (
										<div className="flex items-center gap-4">
											<span>✓</span>
											<span>Right Answer</span>
										</div>
									) : (
										<div className="flex items-center gap-4">
											<span>✗</span>
											<span>Not quite.</span>
										</div>
									)}
								</span>
								<span className="ml-6 mt-1">{option.explanation}</span>
							</div>
						)}
					</button>
				))}
			</div>
		</div>
	);
}
