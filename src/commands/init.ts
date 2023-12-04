import prompts from "prompts";
import {readFileSync, writeFileSync} from "fs";
import {logError} from "../utils/logger";
import path from "path";
import generateTimestamp from "../utils/generate-timestamp";
import { CaseConverterEnum, generateTemplateFilesBatch } from "generate-template-files";
import confirmSupabaseRoot from "../utils/confirm-supabase-root";
/**
 * Creates a new Basejump project cloned from a given repo to a given path
 * @param projectPath
 */
export default async (
    projectPath: string
) => {

    const isSupabaseRoot = confirmSupabaseRoot();
    if (!isSupabaseRoot) {
        logError("This command must be run from the root of a Basejump project.");
        process.exit(1);
    }

    // ask user for project defaults using prompts library
    const {teamAccounts, billingProvider} = await prompts([
        {
            type: "confirm",
            name: "teamAccounts",
            message: "Do you want to use team accounts?",
            initial: true,
        },
        {
            type: "select",
            name: "billingProvider",
            message: "Which billing provider do you want to use? Billing is disabled by default and this can be changed later.",
            choices: [
                {title: "None - Disable billing", value: "none"},
                {title: "Stripe", value: "stripe"}
            ],
            initial: 1
        }
    ]);

    const files = [{
        option: 'Generate migration files',
        defaultCase: CaseConverterEnum.None,
        entry: {
            folderPath: path.join(__dirname, '../../templates/init/supabase/migrations')
        },
        dynamicReplacers: [
            {
                slot: '{{timestamp}}',
                slotValue: generateTimestamp(),
            },
            {
                slot: '{{enableTeamAccounts}}',
                slotValue: teamAccounts ? 'TRUE' : 'FALSE',
            }
        ],
        output: {
            path: path.join(projectPath, 'supabase', 'migrations'),
            overwrite: true
        },
        onComplete() {}
    }];

    if (billingProvider !== "none") {
        files.push({
            option: 'Generate billing functions',
            defaultCase: CaseConverterEnum.None,
            dynamicReplacers: [{
                slot: '{{billingProvider}}',
                slotValue: billingProvider
            }],
            entry: {
                folderPath: path.join(__dirname, '../../templates/init/supabase/functions'),
            },
            output: {
                path: path.join(process.cwd(), 'supabase', 'functions'),
                overwrite: true
            },
            onComplete() {
                // add lines to then end of suapbase/config.toml to disable jwt on billing webhooks
                const configPath = path.join(projectPath, 'supabase', 'config.toml');
                const config = readFileSync(configPath, 'utf-8');
                const newConfig = config + `\n\n[functions.billing-webhooks]\nverify_jwt = false`;
                writeFileSync(configPath, newConfig);
            }
        });
    }

    await generateTemplateFilesBatch(files);
}
