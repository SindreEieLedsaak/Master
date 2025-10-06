/**
 * Generate a random participant ID
 * Format: P + 6 random alphanumeric characters
 * Example: P3K9M2, P7A1B4, etc.
 */
export function generateParticipantId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'P';

    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

/**
 * Validate participant ID format
 * Should start with 'P' followed by 6 alphanumeric characters
 */
export function isValidParticipantId(id: string): boolean {
    const pattern = /^P[A-Z0-9]{6}$/;
    return pattern.test(id);
}
