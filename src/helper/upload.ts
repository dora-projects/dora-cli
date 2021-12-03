import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export function uploadZips(url: string, accessToken: string, data: UploadBackupFields): Promise<void> {
  const form = new FormData();
  form.append('type', 'artifact');
  form.append('appKey', data.appKey);
  form.append('project_name', data.project_name);

  form.append('file_name', data.file_name);
  form.append('file_type', data.file_type);
  form.append('file', fs.createReadStream(data.file_path), {
    filename: data.file_name,
  });

  form.append('git_name', data.git_name);
  form.append('git_email', data.git_email);
  form.append('git_branch', data.git_branch);

  form.append('commit', data.commit);
  form.append('commit_sha', data.commit_sha);
  form.append('commit_ts', data.commit_ts);

  return axios.post(`${url}/manager/file/upload`, form, {
    headers: form.getHeaders(),
  });
}


export function uploadSourcemapZips(url: string, accessToken: string, data: UploadSourcemapFields): Promise<void> {
  const form = new FormData();
  form.append('type', 'sourcemap');
  form.append('appKey', data.appKey);
  form.append('project_name', data.project_name);

  form.append('file_name', data.file_name);
  form.append('file', fs.createReadStream(data.file_path), {
    filename: data.file_name,
  });

  return axios.post(`${url}/manager/file/upload`, form, {
    headers: form.getHeaders(),
  });
}
