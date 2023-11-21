export function getQueryVariable(url, name) {
  let href = url || window.location.href
  let query = href.substring(href.indexOf('?') + 1);
  let vars = query.split("&");
  let obj = {}
  if (query.indexOf('=') > -1) {
    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split("=");
      obj[pair[0]] = pair[1]
    }
  }
  if (name) return obj[name] || null
  return obj;
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}