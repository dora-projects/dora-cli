export interface Config {
  base: Base;
  deploy?: Env[];
}

export interface Base {
  outDir: string;
  appId: string;
  serverUrl: string;
}

export interface Env {
  env: string;
  description: string;
  ip: string;
  user: string;
  destDir: string;
}

export interface UploadBackupFields {
  appId: string
  project_name: string

  file_name: string
  file_type: string
  file_path: string

  git_name?: string
  git_email?: string
  git_branch?: string

  commit?: string
  commit_sha?: string
  commit_ts?: string
}


export interface UploadSourcemapFields {
  appId: string
  project_name: string

  file_name: string
  file_path: string
}
