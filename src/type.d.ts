interface Config {
  base: Base;
  deploy?: Machine[];
}

interface Base {
  outDir: string;
  appKey: string;
  serverUrl: string;
  accessToken: string;
}

interface Machine {
  label: string;
  description: string;
  ip: string;
  user: string;
  destDir: string;
}

interface Tags {
  author: string;
  author_mail: string;
  author_msg: string;
  git_branch: string;
  commit_at: string;
  commit_hash: string;
  release: string;
  timestamp: string;
}

interface UploadBackupFields {
  appKey: string;
  project_name: string;
  release: string;

  author?: string;
  author_mail?: string;
  git_branch: string;
  commit?: string;
  commit_hash?: string;
  commit_at?: string;

  file_name: string;
}

interface UploadSourcemapFields {
  appKey: string;
  project_name: string;
  release: string;
  file_name: string;
}
