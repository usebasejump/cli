#! /usr/bin/env node

import {Command} from "commander";

const program = new Command();

import newProject from "./commands/init";
import generate from "./commands/generate";

/**
 * Create a new Basejump project
 */

program
    .command("init")
    .alias("i")
    .option("-p, --path <projectpath>", "Where should your new project be initialized", '.')
    .description("Generate a new Basejump project")
    .action(async (options) => {
        await newProject(
            options.path
        );  
    });

/**
 * Generate a new model off of a template
 */
program
    .command("generate")
    .alias("g")
    .argument("<template>", "The template you want to generate. Ex: 'table'")
    .argument("<templateName>", "The name of the template you want to generate. Ex: 'users'")
    .argument("[templateinputs...]", "Any columns you want to pass to the template. Ex: 'name:string'")
    .description("Generate a new model off of a template")
    .action(async (template, templateName, templateInputs) => {
        await generate(template, templateName, templateInputs);
    });

program.parse();
