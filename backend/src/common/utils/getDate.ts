export function getCurrentDate(): Date {
	const now = new Date();
	const jakartaOffsetMs = 7 * 60 * 60 * 1000;

	return new Date(now.getTime() + jakartaOffsetMs);
}
