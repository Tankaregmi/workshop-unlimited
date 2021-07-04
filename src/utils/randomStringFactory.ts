const defaultCharset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';

export default function randomStringFactory (length: number, charset = defaultCharset): () => string {
  return () => Array(length)
    .fill(null)
    .reduce(result => {
      return result + charset[Math.floor(Math.random() * charset.length)];
    }, '');
};
