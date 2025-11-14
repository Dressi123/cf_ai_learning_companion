/**
 * Content Generation Types
 */

export interface Flashcard {
	id: number;
	question: string;
	answer: string;
	hint: string;
}

export interface Summary {
	title: string;
	overview: string;
	keyPoints: string[];
}

export interface FlashcardsResponse {
	flashcards: Flashcard[];
}

export interface SummaryResponse {
	title: string;
	overview: string;
	keyPoints: string[];
}
