// 上传到错误监控系统
export const upload = ({ ...args }: { appId: string, url: string }): void => {
  console.log(args);
};


// 还原
export const restore = ({ ...args }: { error: string, absoluteFilePath: string }): void => {
  console.log(args);
};

