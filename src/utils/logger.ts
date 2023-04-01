import chalk from "chalk";

/**
 * Log a message to the console
 * @param message
 */
export function logInfo(message: string) {
    console.log(chalk.gray(message));
}

/**
 * Log an error to the console
 * @param message
 */
export function logError(message: string) {
    console.error(chalk.red(`❌ ${message}`));
}

/**
 * Log a success message to the console
 * @param message
 */
export function logSuccess(message: string) {
    console.log(chalk.green(`✅ ${message}`));
}