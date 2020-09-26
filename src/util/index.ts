/**
 * Shorten text with ellipsis (returns input if short enough)
 * @param {string} text Text to shorten
 * @param {number} total Length to shorten to (without ellipsis)
 * @returns {string} Shortened text
 */
function ellipsis(text: string, total: number): string {
	if (text.length <= total) {
		return text;
	}
	const keep = total - 3;
	if (keep < 1) {
		return text.slice(0, total);
	}
	return `${text.slice(0, keep)}...`;
}

/**
 * Return a Promise which resolves after the specified time
 * @param ms Time to pause for in milliseconds
 * @returns {Promise} A promise which resolves after the specified time
 */
function pause(ms: number): Promise<void> {
	return new Promise(resolve => {
		  setTimeout(resolve, ms);
	});
}

/**
 * Return an array of unique values that's also cleaned of undefined values
 * @param input Array to handle
 * @returns {T[]} Cleaned array of unique values
 */
function uniqueValidatedValues<T>(input: T[]): T[] {
	return Array.from(new Set(input)).filter(element => element ?? false);
}

export { ellipsis, pause, uniqueValidatedValues };
