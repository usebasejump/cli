import prompts from "prompts";
import { logError, logInfo } from "../utils/logger";
import path from "path";
import generateTimestamp from "../utils/generate-timestamp";
import { CaseConverterEnum, generateTemplateFilesBatch } from "generate-template-files";
import confirmSupabaseRoot from "../utils/confirm-supabase-root";
import { downloadAndExtractRepo, getRepoInfo, hasRepo } from "../utils/repo-utils";

const basejumpRepoUrl = new URL("https://github.com/usebasejump/basejump/tree/main");
/**
 * Creates a new Basejump project cloned from a given repo to a given path
 * @param projectPath
 */
export default async (
    projectPath: string
) => {

    const isSupabaseRoot = confirmSupabaseRoot(projectPath);
    if (!isSupabaseRoot) {
        logError("This command must be pointed at the root of a Basejump project.");
        process.exit(1);
    }

    // ask user for project defaults using prompts library
    const { teamAccounts, teamAccountBilling, personalAccountBilling, starterApp, enableTesting } = await prompts([
        {
            type: "confirm",
            name: "teamAccounts",
            message: "Do you want to use team accounts?",
            initial: true,
        },
        {
            type: "confirm",
            name: "teamAccountBilling",
            message: "Would you like to enable subscription billing for TEAM accounts? You can change this at any time",
            initial: true
        },
        {
            type: "confirm",
            name: "personalAccountBilling",
            message: "Would you like to enable subscription billing for PERSONAL accounts? You can change this at any time",
            initial: false
        },
        {
            type: "confirm",
            name: "enableTesting",
            message: "Do you want to enable testing for your project by installing supabase_test_helpers?",
            initial: true
        },
        {
            type: "select",
            name: "starterApp",
            message: "Would you like to also leverage our Starter app? It's pretty awesome",
            choices: [
                { title: "None - just the SQL migrations", value: "none" },
                { title: "Nextjs", value: "https://github.com/usebasejump/basejump-next/tree/main" }
            ],
            initial: 1
        },

    ]);

    const root = path.resolve(projectPath)

    /**
     * First we download the basejump core repo to setup the basic project
     */

    const basejumpRepoInfo = await getRepoInfo(basejumpRepoUrl)

    if (!basejumpRepoInfo) {
        logError(
            `Found invalid GitHub URL: "${starterApp}". Please fix the URL and try again.`
        )
        process.exit(1)
    }

    console.log(basejumpRepoInfo);

    const found = await hasRepo(basejumpRepoInfo)

    if (!found) {
        logError(
            `Could not locate the repository for "${starterApp}". Please check that the repository exists and try again.`
        )
        process.exit(1)
    }

    logInfo(`Downloading Basejump core repo into ${root}`)

    await downloadAndExtractRepo(root, basejumpRepoInfo);


    /**
     * Generate the supabase migration files
    */
    const files = [{
        option: 'Generate migration files',
        defaultCase: CaseConverterEnum.None,
        entry: {
            folderPath: path.join(__dirname, '../../templates/init/configuration')
        },
        dynamicReplacers: [
            {
                slot: '{{timestamp}}',
                slotValue: generateTimestamp(),
            },
            {
                slot: '{{enableTeamAccounts}}',
                slotValue: teamAccounts ? 'TRUE' : 'FALSE',
            },
            {
                slot: '{{teamAccountBilling}}',
                slotValue: teamAccountBilling ? 'TRUE' : 'FALSE',
            },
            {
                slot: '{{personalAccountBilling}}',
                slotValue: personalAccountBilling ? 'TRUE' : 'FALSE',
            }
        ],
        output: {
            path: path.join(projectPath, 'supabase', 'migrations'),
            overwrite: true
        },
        onComplete() { }
    }];

    if (enableTesting) {
        files.push({
            option: 'Add testing support',
            defaultCase: CaseConverterEnum.None,
            dynamicReplacers: [
                {
                    slot: '{{timestamp}}',
                    slotValue: generateTimestamp(),
                },
            ],
            entry: {
                folderPath: path.join(__dirname, '../../templates/init/testing'),
            },
            output: {
                path: path.join(projectPath, 'supabase', 'migrations'),
                overwrite: true
            },
            onComplete() { }
        });
    }

    await generateTemplateFilesBatch(files);

    /**
     * Generate the starter app if selected
     */

    if (starterApp !== 'none') {
        let repoUrl: URL | undefined

        try {
            repoUrl = new URL(starterApp)
        } catch (error: unknown) {
            const err = error as Error & { code: string | undefined }
            if (err.code !== 'ERR_INVALID_URL') {
                logError(error as string)
                process.exit(1)
            }
        }

        if (!repoUrl) {
            logError(
                `Invalid URL: "${starterApp}". Please use a valid URL and try again.`
            )
            process.exit(1)
        }

        if (repoUrl.origin !== 'https://github.com') {
            logError(
                `Invalid URL: "${starterApp}". Only GitHub repositories are supported. Please use a GitHub URL and try again.`
            )
            process.exit(1)
        }

        const repoInfo = await getRepoInfo(repoUrl)

        if (!repoInfo) {
            logError(
                `Found invalid GitHub URL: "${starterApp}". Please fix the URL and try again.`
            )
            process.exit(1)
        }

        const found = await hasRepo(repoInfo)

        if (!found) {
            logError(
                `Could not locate the repository for "${starterApp}". Please check that the repository exists and try again.`
            )
            process.exit(1)
        }

        await downloadAndExtractRepo(root, repoInfo);

    }
}
