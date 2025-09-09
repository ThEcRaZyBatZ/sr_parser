const read = () => {
  const input = document.getElementById('grammar') as HTMLTextAreaElement;
  const string_input = document.getElementById('string') as HTMLInputElement;
  const productionRules: string[] = input.value.split("\n").map(s => s.trim()).filter(Boolean);
  const string_value = string_input.value.trim();
  const steps = MainLogic(hashThis(productionRules), string_value);
  renderTable(steps);
};

const hashThis = (productionRules: string[]): Map<string, string[]> => {
  const hashMap = new Map<string, string[]>();
  for (const element of productionRules) {
    const parts = element.split("->");
    if (parts.length < 2) continue;
    const key = parts.shift()!.trim();
    const value = parts.join("->").trim();
    const productions = value.split("|").map(p => p.trim()).filter(p => p.length > 0);
    if (!hashMap.has(key)) hashMap.set(key, []);
    hashMap.get(key)!.push(...productions);
  }
  return hashMap;
};

const MainLogic = (hashMap: Map<string, string[]>, inputString: string): [string, string, string][] => {
  const steps: [string, string, string][] = [];
  const startSymbol = (hashMap.keys().next().value ?? "") as string;
  const prodList: [string, string][] = [];
  for (const [lhs, prods] of hashMap.entries()) {
    for (const p of prods) prodList.push([p, lhs]);
  }
  prodList.sort((a, b) => b[0].length - a[0].length);
  let stack = "$";
  let input = inputString + "$";
  steps.push([stack, input, "Initialize"]);

  while (true) {
    if (stack === "$" + startSymbol && input === "$") {
      steps.push([stack, input, "ACCEPT"]);
      break;
    }

    let didReduce = false;
    let again = true;
    while (again) {
      again = false;
      for (const [prod, lhs] of prodList) {
        if (prod.length === 0) continue;
        if (stack.endsWith(prod)) {
          stack = stack.slice(0, stack.length - prod.length) + lhs;
          steps.push([stack, input, `Reduce ${prod} → ${lhs}`]);
          didReduce = true;
          again = true;
          break;
        }
      }
    }

    if (didReduce) continue;

    if (input.length > 1) {
      stack += input[0];
      input = input.substring(1);
      steps.push([stack, input, "Shift"]);
      continue;
    } else {
      steps.push([stack, input, "REJECT"]);
      break;
    }
  }

  return steps;
};

const renderTable = (steps: [string, string, string][]) => {
  const output = document.getElementById("output") as HTMLDivElement;
  let html = "<table><tr><th>STACK</th><th>INPUT</th><th>ACTION</th></tr>";
  for (const [stack, input, action] of steps) {
    const rowClass = action === "ACCEPT" ? "accept" : action === "REJECT" ? "reject" : "";
    html += `<tr class="${rowClass}"><td>${escapeHtml(stack)}</td><td>${escapeHtml(input)}</td><td>${escapeHtml(action)}</td></tr>`;
  }
  html += "</table>";
  output.innerHTML = html;
};

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

document.getElementById('run')!.addEventListener("click", read);
