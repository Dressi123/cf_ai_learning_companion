import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

/**
 * Props interface for the Toast component
 */
interface ToastProps {
	message: string;
	type: "success" | "error";
	onClose: () => void;
}

/**
 * Toast component for displaying temporary notifications (success or error)
 * Features smooth slide-in/out animations and auto-dismiss functionality
 *
 * @param props - The component props containing message, type, and close handler
 * @returns JSX element containing an animated toast notification
 */
export default function Toast({ message, type, onClose }: ToastProps) {
	const [visible, setVisible] = useState(false); // Start hidden

	useEffect(() => {
		// Reset to hidden state when message changes
		setVisible(false);

		// Animate in immediately after mount/message change
		const animateIn = setTimeout(() => {
			setVisible(true);
		}, 10); // Small delay to ensure component is mounted

		// Auto-hide after 3 seconds
		const autoHide = setTimeout(() => {
			setVisible(false);
		}, 3000);

		return () => {
			clearTimeout(animateIn);
			clearTimeout(autoHide);
		};
	}, [message]); // Add message as dependency

	// When visibility changes to false, call onClose after animation
	useEffect(() => {
		if (!visible) {
			const timer = setTimeout(onClose, 300); // match slide-out duration
			return () => clearTimeout(timer);
		}
	}, [visible, onClose]);

	const styles = {
		success: {
			bg: "bg-green-100 dark:bg-green-900/30",
			border: "border-green-400 dark:border-green-600",
			text: "text-green-700 dark:text-green-300",
			hoverText: "hover:text-green-900 dark:hover:text-green-100",
		},
		error: {
			bg: "bg-red-100 dark:bg-red-900/30",
			border: "border-red-400 dark:border-red-600",
			text: "text-red-700 dark:text-red-300",
			hoverText: "hover:text-red-900 dark:hover:text-red-100",
		},
	};

	const currentStyle = styles[type];

	return (
		<div
			className={`fixed top-4 right-4 z-50 w-auto max-w-md p-2 ${currentStyle.bg} border ${currentStyle.border} ${currentStyle.text} rounded-lg flex items-center
                  shadow-lg transition-all duration-300 ${
						visible ? "transform translate-y-0 opacity-100" : "transform -translate-y-12 opacity-0"
					}`}
		>
			<span className="flex-1">{message}</span>
			<button
				onClick={() => setVisible(false)}
				className={`ml-3 ${currentStyle.text} ${currentStyle.hoverText} hover:scale-110 transition-transform cursor-pointer shrink-0`}
			>
				<AiOutlineClose size={20} />
			</button>
		</div>
	);
}

// Keep the old name as an alias for backward compatibility
export { Toast as ErrorToast };
