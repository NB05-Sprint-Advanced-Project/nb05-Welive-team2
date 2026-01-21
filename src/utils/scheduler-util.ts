export const createSingleTaskScheduler = () => {
  let isRunning = false;

  return async (task: () => Promise<void>) => {
    if (isRunning) return;

    try {
      isRunning = true;
      await task();
    } finally {
      isRunning = false;
    }
  };
};
