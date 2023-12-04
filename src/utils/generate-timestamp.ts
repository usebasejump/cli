export default function generateTimestamp() {
    // returns in format YYYYMMDDHHMMSS
    return new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
}