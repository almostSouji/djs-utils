/**
 * Shorten text with ellipsis (returns input if short enough)
 * @param {string} text Text to shorten
 * @param {number} length Length to shorten to (without ellipsis)
 * @returns {string} Shortened text
 */
function ellipsis(text: string, length: number): string {
	if (text.length > length) {
		return `${text.slice(0, length - 3)}...`;
	}
	return text;
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

export { ellipsis, pause };
