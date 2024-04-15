export default function generateTimestamp(increment = 0) {
    const date = new Date();
    date.setSeconds(date.getSeconds() + increment);
    return date.toISOString().replace(/[^0-9]/g, "").slice(0, 14);
}