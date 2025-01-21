import { ConcateCallBack } from "./types";

/**
 * Use to concatenate string. Pass a string to first parameter and pass other strings,
 * functions or just a string to second parameter.
 * @param o original string, is a string you want to be concatenated with `vals`.
 * @param vals can be a function, string, array of function or array of string.
 * @returns
 */
function concate(
  o: string,
  vals:
    | Array<string | typeof ConcateCallBack | undefined>
    | string
    | typeof ConcateCallBack
    | undefined
) {
  if (Array.isArray(vals)) {
    for (const val of vals) {
      o = concate(o, val);
    }
    return o;
  }

  if (typeof vals === "string") {
    if (!vals) return vals;
    return o + " " + vals;
  }

  if (typeof vals === "function" && vals()) {
    return o + " " + vals();
  } else {
    return o;
  }
}

/**
 * Get valid path for URL
 * @param parts
 * @returns
 */
function formatURL(...parts: Array<string>) {
  let result = parts[0];

  for (let i = 1; i < parts.length; i++) {
    let str = parts[i];
    if (str[0] !== "/") str = "/" + str;
    result += str;
  }

  result = result.replaceAll(/\/+/g, "/");

  if (result[0] === "/") return result.replaceAll(/\/+/g, "/");

  return result;
}

export const StringUtils = {
  concate,
  formatURL,
};
