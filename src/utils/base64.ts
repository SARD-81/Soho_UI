// Base64 is transport encoding only. It does not provide confidentiality.
export const encodeUtf8ToBase64 = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binaryValue = '';

  bytes.forEach((byte) => {
    binaryValue += String.fromCharCode(byte);
  });

  return window.btoa(binaryValue);
};
