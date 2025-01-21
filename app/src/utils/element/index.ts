/**
 * Use this function to check if an element is scrollable.
 * @param element
 * @returns
 */
function isScrollable<T extends HTMLElement>(element: T) {
  if (!element) return;

  const cssStyles = window.getComputedStyle(element);
  const overflowValue = cssStyles.getPropertyValue("overflow");
  const check = element.scrollHeight > element.clientHeight;
  return check && (overflowValue === "scroll" || overflowValue === "auto");
}

export const ElementUtils = {
  isScrollable,
};
