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
}
