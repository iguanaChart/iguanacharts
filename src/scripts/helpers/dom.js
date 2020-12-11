export const clearNode = function (node) {
  while (node && node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
