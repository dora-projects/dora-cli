import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const timeNowFormat = (timezone?: string): string => {
  return dayjs().tz(timezone ? timezone : 'Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
};
