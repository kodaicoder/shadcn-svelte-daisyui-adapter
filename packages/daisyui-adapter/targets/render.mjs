export const keyToken = (key) => (/^[A-Za-z_$][\w$]*$/.test(key) ? key : `"${key}"`);
