import simpleGit, { SimpleGit, SimpleGitOptions, LogResult, ConfigListSummary } from 'simple-git';

const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
};

export const git: SimpleGit = simpleGit(options);

export async function getGitLogs(): Promise<LogResult> {
  return git.log();
}

export async function getGitConfig(): Promise<ConfigListSummary> {
  return git.listConfig();
}

