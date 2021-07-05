export interface Config {
  base: Base;
  cmd: Cmd;
}

export interface Base {
  outDir: string;
  appId: string;
  serverUrl: string;
}

export interface Cmd {
  deploy?: {
    [key: string]: hostEnv
  };
}

export interface hostEnv {
  host: string;
  user: string;
  destDir: string;
}

export interface BackupFields {
  appId: string
  project_name: string

  file_name: string
  file_type: string
  file_path: string

  git_name: string
  git_email: string
  git_branch: string

  commit: string
  commit_sha: string
  commit_ts: string
}
