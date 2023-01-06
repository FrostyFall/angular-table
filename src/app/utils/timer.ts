export default function timer(time: number) {
  return new Promise<void>((res, _) => {
    setTimeout(() => {
      res();
    }, time);
  });
}
