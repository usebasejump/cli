import {existsSync} from "fs";
import path from "path";

export default function(pathName = "."): boolean {
    // make sure we're in a basejump project root
    const filePath = path.join(pathName, "supabase", "config.toml");
    const supabaseConfigExists = existsSync(filePath);        
    return supabaseConfigExists;
}