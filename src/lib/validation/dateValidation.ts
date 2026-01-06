export const validateDateUpdate = (
    currentModified: string | null,
    newModified: string,
    contentChanged: boolean
): boolean => {
    // Prevent auto-updating date_modified on build/deploy
    if (!contentChanged) {
        console.warn('date_modified should not update without content changes');
        return false;
    }

    // Prevent setting to "now" automatically
    const newDate = new Date(newModified);
    const now = new Date();
    const diffMinutes = Math.abs(now.getTime() - newDate.getTime()) / (1000 * 60);

    if (diffMinutes < 5) {
        console.warn('Suspicious: date_modified set to current timestamp. Was this intentional?');
    }

    return true;
};

export const shouldUpdateDateModified = (changes: {
    expertInsight?: boolean;
    decisionSnapshot?: boolean;
    contentRewrite?: boolean;
    legalUpdate?: boolean;
}): boolean => {
    // Only update date_modified for meaningful changes
    return Object.values(changes).some(changed => changed === true);
};
