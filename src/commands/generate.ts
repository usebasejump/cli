import {logError} from "../utils/logger";
import copyTemplateFile from "../utils/copy-template-file";
import confirmSupabaseRoot from "../utils/confirm-supabase-root";

type TEMPLATE_TYPES = "model";

export default async function(templateType: TEMPLATE_TYPES) {
    // make sure we're in a basejump project root
    const isSupabaseRoot = confirmSupabaseRoot();
    if (!isSupabaseRoot) {
        logError("This command must be run from the root of a Basejump project.");
        process.exit(1);
    }

    switch (templateType) {
        case "model":
            await copyTemplateFile("model.sql", `./supabase/migrations/{{modelName}}.sql`);
            break;
        default:
            logError(`Unknown template type: ${templateType}`);
            process.exit(1);
    }
}