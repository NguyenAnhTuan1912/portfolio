// Import types
import type { BlogType } from "./types";

export class BlogUtils {
  /**
   * Use to get date as string by blog format
   * @param dateNum
   * @returns
   */
  static toBlogDateStr(dateNum: number) {
    const date = new Date(dateNum);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }

  /**
   * Use to sort blog by `createdAt`
   * @param blogs
   * @returns
   */
  static sortNewest(blogs: Array<BlogType>) {
    return blogs.sort((a, b) => b.createdAt - a.createdAt);
  }
}
