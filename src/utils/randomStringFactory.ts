const defaultCharset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';

export default (length: number, charset = defaultCharset) => {
  return () => Array(length)
    .fill(null)
    .reduce(result => {
      return result + charset[Math.floor(Math.random() * charset.length)];
    }, '');
};;
