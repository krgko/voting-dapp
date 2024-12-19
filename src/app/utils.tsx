export function isEthAddress(address: string): boolean {
  return /0x[0-9a-f]{40}/.test(address.toLowerCase());
}
