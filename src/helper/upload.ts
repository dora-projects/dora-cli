import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export function uploadZips(
  url: string,
  accessToken: string,
  file: string,
  data: UploadBackupFields,
): Promise<void> {
  const form = new FormData();
  form.append('type', 'artifact');

  form.append('appKey', data.appKey);
  form.append('project_name', data.project_name);
  form.append('release', data.release);

  form.append('author', data.author);
  form.append('author_mail', data.author_mail);

  form.append('git_branch', data.git_branch);
  form.append('commit', data.commit);
  form.append('commit_hash', data.commit_hash);
  form.append('commit_at', data.commit_at);

  form.append('file_name', data.file_name);
  form.append('file', fs.createReadStream(file));

  return axios.post(`${url}/manager/file/upload`, form, { headers: form.getHeaders() });
}

export function uploadSourcemapZips(
  url: string,
  accessToken: string,
  file: string,
  data: UploadSourcemapFields,
): Promise<void> {
  const form = new FormData();
  form.append('type', 'sourcemap');

  form.append('appKey', data.appKey);
  form.append('project_name', data.project_name);
  form.append('release', data.release);

  form.append('file_name', data.file_name);
  form.append('file', fs.createReadStream(file));

  return axios.post(`${url}/manager/file/upload`, form, { headers: form.getHeaders() });
}
