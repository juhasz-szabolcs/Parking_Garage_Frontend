export function formatLicensePlate(licensePlate) {
    if (!licensePlate) return '';

    const normalized = String(licensePlate).toUpperCase().replace(/[^A-Z0-9]/g, '');

    // New Hungarian format: 4 letters + 3 digits => "AA AA 123"
    if (/^[A-Z]{4}\d{3}$/.test(normalized)) {
        return `${normalized.slice(0, 2)} ${normalized.slice(2, 4)} ${normalized.slice(4)}`;
    }

    // Old Hungarian format: 3 letters + 3 digits => "AAA 123"
    if (/^[A-Z]{3}\d{3}$/.test(normalized)) {
        return `${normalized.slice(0, 3)} ${normalized.slice(3)}`;
    }

    return String(licensePlate).toUpperCase().trim();
}

export function normalizeLicensePlate(licensePlate) {
    if (!licensePlate) return '';
    return String(licensePlate).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidHungarianLicensePlate(licensePlate) {
    const normalized = normalizeLicensePlate(licensePlate);
    // 1990-es formatum: AAA123 (3 betu + 3 szam)
    const oldFormat = /^[A-Z]{3}\d{3}$/;
    // 2022-es formatum: AAAA123 (4 betu + 3 szam)
    const newFormat = /^[A-Z]{4}\d{3}$/;
    return oldFormat.test(normalized) || newFormat.test(normalized);
}