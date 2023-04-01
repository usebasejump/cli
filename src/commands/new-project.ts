import {cloneRepo} from "../utils/clone-repo";
import prompts from "prompts";
import {readFileSync, writeFileSync} from "fs";
import generateSeedFile from "../utils/generate-seed-file";
import {logInfo, logSuccess} from "../utils/logger";

/**
 * Creates a new Basejump project cloned from a given repo to a given path
 * @param projectRepo
 * @param projectPath
 */
export default async (
    projectRepo: string,
    projectPath: string
) => {
    // the name of the project is the last part of the projectPath
    const pathProjectName = projectPath.split("/").pop();

    // ask user for project defaults using prompts library
    const {projectName, teamAccounts, personalAccounts, billingProvider} = await prompts([
        {
            type: "text",
            name: "projectName",
            message: "What is the name of your project?",
            initial: pathProjectName,
        },
        {
            type: "confirm",
            name: "teamAccounts",
            message: "Do you want to use team accounts?",
            initial: true,
        },
        {
            type: "confirm",
            name: "personalAccounts",
            message: "Do you want to use personal accounts?",
            initial: true,
        },
        {
            type: "select",
            name: "billingProvider",
            message: "Which billing provider do you want to use? Billing is disabled by default and this can be changed later.",
            choices: [
                {title: "None", value: "none"},
                {title: "Stripe", value: "stripe"}
            ],
            initial: 0,
        }
    ]);

    logInfo("Setting up your project...");

    await cloneRepo(projectRepo, projectPath);

    // replace the supabase/seeds.sql file with the correct values
    const seedsFile = `${projectPath}/supabase/seed.sql`;
    // we know exactly what we want the file to be, so we just overwrite it with the correct values
    await writeFileSync(seedsFile, generateSeedFile(teamAccounts, personalAccounts, billingProvider), "utf8");

    // replace the supabase project name with the project name
    const supabaseConfigFile = `${projectPath}/supabase/config.toml`;
    // the project name is stored as project_id = "project-name"
    const supabaseConfig = readFileSync(supabaseConfigFile, "utf8");
    const newSupabaseConfig = supabaseConfig.replace(/project_id = ".*"/, `project_id = "${projectName}"`);
    await writeFileSync(supabaseConfigFile, newSupabaseConfig, "utf8");
    logSuccess("Project setup complete!");
    logSuccess(`Your project is ready at ${projectPath}`);
}
