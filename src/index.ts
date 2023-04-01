#! /usr/bin/env node

import {Command} from "commander";

const program = new Command();

import newProject from "./commands/new-project";
import generate from "./commands/generate";

/**
 * Create a new Basejump project
 */
program
    .command("new")
    .alias("n")
    .argument("<projectpath>", "Where should your new project be created")
    .option(
        "-r, --repo <projectrepo>",
        "Specify which project you want to clone. Must be the TAR download URL of a GitHub repo",
        "https://github.com/usebasejump/basejump/archive/main.tar.gz"
    )
    .description("Generate a new Basejump project")
    .action(async (projectPath, options) => {
        await newProject(
            options.repo,
            projectPath
        );
    });

/**
 * Generate a new model off of a template
 */
program
    .command("generate")
    .alias("g")
    .argument("<template>", "The template you want to generate. Ex: 'model'")
    .description("Generate a new model off of a template")
    .action(async (template) => {
        await generate(template);
    });

program.parse();
