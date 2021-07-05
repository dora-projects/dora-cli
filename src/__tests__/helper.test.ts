import { timeNowFormat } from '../helper/time';
import dayjs from 'dayjs';

it('timeNowFormat', () => {
  const d1 = timeNowFormat('Asia/Tokyo');
  const d2 = timeNowFormat();
  const diff = dayjs(d1).diff(d2, 'hour');
  expect(diff).toEqual(1);
});

