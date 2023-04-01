import {readFileSync, writeFileSync} from "fs";
import prompts from "prompts";

export default async function(templateName: string, destinationPath: string) {
    // first we load the template path so we can parse it
    const template = await readFileSync(`../templates/${templateName}`, "utf8");
    // we store variables in the template as {{variableName}}. We want to extract them all so we can ask the user for inputs
    const variables = template.match(/{{(.*?)}}/g);
    // we then ask the user for inputs for each variable
    const answers = await prompts((variables || []).map(variable => {
        return {
            type: "text",
            name: variable,
            message: `What is the value for ${variable}?`,
        }
    }));
    // we then replace the variables in the template with the user's answers
    const output = template.replace(/{{(.*?)}}/g, (match, variable) => answers[match]);
    // the destinationPath can also have variables inside of it, so we replace those too
    const finalDestinationPath = destinationPath.replace(/{{(.*?)}}/g, (match, variable) => answers[match]);
    // we then write the output to the destination path
    writeFileSync(finalDestinationPath, output, "utf8");
}