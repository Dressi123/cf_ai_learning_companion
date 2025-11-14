"use client";

import { LuBookOpenText } from "react-icons/lu";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { CodingQuestion } from "@/types/codingTypes";

interface DescriptionPanelProps {
	codingQuestion: CodingQuestion | null;
	isSelected: boolean;
	onSelect: () => void;
}

export default function DescriptionPanel({ codingQuestion, isSelected, onSelect }: DescriptionPanelProps) {
	return (
		<div
			onClick={onSelect}
			className={`bg-[#262626] overflow-hidden rounded ${
				isSelected ? "border border-[#606060]" : "border border-transparent"
			}`}
			style={{ width: "25%" }}
		>
			<div className="min-w-[300px] h-full overflow-auto">
				<div className="sticky top-0 z-10 flex items-center justify-between px-1 py-1 bg-[#333333]">
					<span className="text-gray-300 text-sm font-bold flex items-center py-1 px-2 rounded hover:bg-[#434343] cursor-pointer">
						<LuBookOpenText className="text-blue-500 mr-1" /> Description
					</span>
				</div>
				<div className="p-6">
					{codingQuestion ? (
						<>
							<h1 className="text-2xl font-bold mb-2 text-white">{codingQuestion.title}</h1>
							<span
								className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-4 ${
									codingQuestion.difficulty === "EASY"
										? "bg-green-600 text-white"
										: codingQuestion.difficulty === "MEDIUM"
										? "bg-yellow-600 text-white"
										: "bg-red-600 text-white"
								}`}
							>
								{codingQuestion.difficulty}
							</span>
							<div className="text-gray-300 mb-4">
								<MarkdownRenderer content={codingQuestion.description} />
							</div>
							{codingQuestion.examples && codingQuestion.examples.length > 0 && (
								<div className="mb-4">
									<h3 className="font-bold text-white mb-2">Examples:</h3>
									{codingQuestion.examples.map((example, idx) => (
										<div key={idx} className="mb-3">
											<div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-[#444444]">
												<div className="px-3 py-2 bg-[#2a2a2a] border-b border-[#444444]">
													<span className="text-gray-400 text-xs font-semibold">
														Example {idx + 1}
													</span>
												</div>
												<div className="p-3 space-y-2">
													<div>
														<div className="text-gray-400 text-xs font-semibold mb-1">
															Input:
														</div>
														<code className="block bg-[#262626] text-green-400 px-3 py-2 rounded font-mono text-sm border border-[#333333]">
															{example.input}
														</code>
													</div>
													<div>
														<div className="text-gray-400 text-xs font-semibold mb-1">
															Output:
														</div>
														<code className="block bg-[#262626] text-blue-400 px-3 py-2 rounded font-mono text-sm border border-[#333333]">
															{example.output}
														</code>
													</div>
													{example.explanation && (
														<div className="pt-1">
															<div className="text-gray-400 text-xs font-semibold mb-1">
																Explanation:
															</div>
															<p className="text-gray-300 text-sm italic">
																{example.explanation}
															</p>
														</div>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
							{codingQuestion.constraints && (
								<div className="mb-4">
									<h3 className="font-bold text-white mb-2">Constraints:</h3>
									{(codingQuestion.constraints.timeComplexity ||
										codingQuestion.constraints.spaceComplexity) && (
										<div className="mb-2 space-y-1">
											{codingQuestion.constraints.timeComplexity && (
												<p className="text-gray-300">
													<strong>Time Complexity:</strong>{" "}
													<code className="bg-[#333333] text-blue-500 px-1.5 py-0.5 rounded font-mono text-sm">
														{codingQuestion.constraints.timeComplexity}
													</code>
												</p>
											)}
											{codingQuestion.constraints.spaceComplexity && (
												<p className="text-gray-300">
													<strong>Space Complexity:</strong>{" "}
													<code className="bg-[#333333] text-blue-500 px-1.5 py-0.5 rounded font-mono text-sm">
														{codingQuestion.constraints.spaceComplexity}
													</code>
												</p>
											)}
										</div>
									)}
									<div className="space-y-1">
										{codingQuestion.constraints.rules
											.filter((rule) => rule && rule.trim())
											.map((rule, idx) => {
												// Check if rule looks like a code constraint (contains <=, >=, <, >, or starts with digit)
												const isCodeConstraint = /^[\d-]|[<>]=?/.test(rule);

												return isCodeConstraint ? (
													<div key={idx}>
														<code className="block bg-[#262626] text-gray-300 px-3 py-2 rounded font-mono text-sm border border-[#333333]">
															{rule}
														</code>
													</div>
												) : (
													<div key={idx}>
														<MarkdownRenderer content={rule} inline />
													</div>
												);
											})}
									</div>
								</div>
							)}
						</>
					) : (
						<p className="text-gray-400">Failed to load question</p>
					)}
				</div>
			</div>
		</div>
	);
}
