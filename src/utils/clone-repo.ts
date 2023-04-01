import { join } from 'path'
import {tmpdir} from "os";
import { Stream } from 'stream'
import { promisify } from 'util'
import tar from "tar";
import {createWriteStream, promises as fs} from "fs";
import got from "got"

const pipeline = promisify(Stream.pipeline)

/**
 * Downloads a given repo URL to a temporary file
 * @param repo
 */
async function downloadRepo(repo: string) {
    const tempFile = join(tmpdir(), `basejump-clone-${Date.now()}`)
    await pipeline(got.stream(repo), createWriteStream(tempFile))
    return tempFile
}

/**
 * Clones a repo to a given path
 * @param repo
 * @param projectPath
 */
export async function cloneRepo(repo: string, projectPath: string) {
    const tempFile = await downloadRepo(repo);
    await fs.mkdir(projectPath, {recursive: true})
    await tar.x({
        file: tempFile,
        cwd: projectPath,
        strip: 1
    })

    await fs.unlink(tempFile)
}