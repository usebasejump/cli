import {logError} from "../utils/logger";
import confirmSupabaseRoot from "../utils/confirm-supabase-root";
import {CaseConverterEnum, generateTemplateFilesBatch} from "generate-template-files";
import * as path from "path";
import generateTimestamp from "../utils/generate-timestamp";

type TEMPLATE_TYPES = "table";
/**
 * Returns table columns, formatted for a sql migration file
 * with commas and newlines. a tab is after each newline.
 * @param items
 */
function convertIntoColumns(items: string[]): string {
    return items.map(item => {
        const [name, type] = item.split(":");
        if (!name) return;
        switch (type) {
            case "string":
                return `${name} text,`;
            case "number":
                return `${name} integer,`;
            case "boolean":
                return `${name} boolean,`;
            case "date":
                return `${name} date,`;
            default:
                return `${name} text,`;
        }
    }).filter(Boolean).join("\n\t");
}

export default async function (templateType: TEMPLATE_TYPES, templateName: string, templateInputs: string[] = []) {
    // make sure we're in a basejump project root
    const isSupabaseRoot = confirmSupabaseRoot();
    if (!isSupabaseRoot) {
        logError("This command must be run from the root of a Basejump project.");
        process.exit(1);
    }

    switch (templateType) {
        case "table":
            await generateTemplateFilesBatch([{
                option: 'Generate table migration',
                defaultCase: CaseConverterEnum.SnakeCaseUnderscore,
                entry: {
                    folderPath: path.join(__dirname, '../../templates/table/migrations/')
                },
                dynamicReplacers: [
                    {
                        slot: '{{name}}',
                        slotValue: templateName,

                    },
                    {
                        slot: '{{timestamp}}',
                        slotValue: generateTimestamp(),
                    },
                    {
                        slot: '{{templateInputs}}',
                        slotValue: convertIntoColumns(templateInputs),
                    }
                ],
                output: {
                    path: path.join(process.cwd(), 'supabase', 'migrations'),
                    pathAndFileNameDefaultCase: CaseConverterEnum.SnakeCaseUnderscore,
                    overwrite: true
                }
            }, {
                option: 'Generate table test',
                defaultCase: CaseConverterEnum.PascalCase,
                entry: {
                    folderPath: path.join(__dirname, '../../templates/table/tests/'),
                },
                dynamicReplacers: [
                    {
                        slot: '__name__',
                        slotValue: templateName,

                    },
                    {
                        slot: '__timestamp__',
                        slotValue: Date.now().toString(),
                    },
                    {
                        slot: '__templateInputs__',
                        slotValue: convertIntoColumns(templateInputs),
                    }
                ],
                output: {
                    path: path.join(process.cwd(), 'supabase', 'tests'),
                    pathAndFileNameDefaultCase: CaseConverterEnum.CamelCase,
                    overwrite: true
                }
            }]);
            break;
        default:
            logError(`Unknown template type: ${templateType}`);
            process.exit(1);
    }
}