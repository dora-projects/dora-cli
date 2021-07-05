import fs from 'fs';
import fsEx from 'fs-extra';
import path from 'path';
import archiver from 'archiver';

export function copy(src: string, dest: string, checkMatch: (filePath: string) => boolean): void {
  const recursionCopyFile = function(fromDir: string, toDir: string): void {
    const stats = fsEx.statSync(fromDir);

    if (stats.isDirectory()) {
      fsEx.mkdirsSync(toDir);
      fsEx.readdirSync(fromDir).forEach(function(childItemName) {
        recursionCopyFile(path.join(fromDir, childItemName), path.join(toDir, childItemName));
      });

    } else {
      if (checkMatch(fromDir)) {
        fsEx.copyFileSync(fromDir, toDir);
      }
    }
  };

  recursionCopyFile(src, dest);
}


export function isExist(path: string): boolean {
  return fsEx.existsSync(path);
}

export function compress(fromDir: string, destDir: string): Promise<void> {
  const output = fs.createWriteStream(destDir);
  const archive = archiver('zip', {
    zlib: { level: 5 }, // Sets the compression level.
  });
  archive.pipe(output);
  archive.directory(fromDir, false);
  return archive.finalize();
}
