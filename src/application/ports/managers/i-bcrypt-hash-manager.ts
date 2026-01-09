export interface IHashManager {
  hash: (plainString: string) => Promise<string>;
  compare: (plainString: string, hashedString: string) => Promise<boolean>;
}
