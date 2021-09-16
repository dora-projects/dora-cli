import { timeNowFormat } from './time';
import { getGitConfig } from './git';
import dayjs from 'dayjs';

it('timeNowFormat', () => {
  const d1 = timeNowFormat('Asia/Tokyo');
  const d2 = timeNowFormat();
  const diff = dayjs(d1).diff(d2, 'hour');
  expect(diff).toEqual(1);
});

it('getGitConfig', async () => {
  const d1 = await getGitConfig();
  console.log(JSON.stringify(d1, null, 2));
});
