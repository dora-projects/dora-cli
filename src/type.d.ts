interface Config {
  base: Base;
  deploy?: Machine[];
}

interface Base {
  outDir: string;
  appId: string;
  serverUrl: string;
}

interface Machine {
  label: string;
  description: string;
  ip: string;
  user: string;
  destDir: string;
}

interface UploadBackupFields {
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


interface UploadSourcemapFields {
  appId: string
  project_name: string

  file_name: string
  file_path: string
}
