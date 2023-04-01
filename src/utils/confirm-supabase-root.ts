import {existsSync} from "fs";

export default function(): boolean {
    // make sure we're in a basejump project root
    const supabaseConfigExists = existsSync("./supabase/config.toml");
    // make sure supabase migrations folder exists
    const supabaseMigrationsExists = existsSync("./supabase/migrations");
    return supabaseConfigExists && supabaseMigrationsExists;
}