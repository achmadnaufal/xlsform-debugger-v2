/**
 * Dependency graph analysis for XLSForm fields.
 *
 * Builds a directed graph from field expressions (relevant, constraint,
 * calculation, choiceFilter) and detects circular dependencies using
 * DFS with white/gray/black coloring.
 */

import type { FieldMeta } from "./xformParser";
import { extractVarRefs } from "./xformParser";

export interface CycleInfo {
  readonly path: readonly string[];
  readonly expressions: readonly string[];
}

/**
 * Build a dependency graph: field name → field names it depends on.
 */
export function buildDependencyGraph(
  fields: Map<string, FieldMeta>,
): Map<string, readonly string[]> {
  const graph = new Map<string, readonly string[]>();
  const allNames = new Set(fields.keys());

  fields.forEach((field, name) => {
    const deps = new Set<string>();
    const expressions = [field.relevant, field.constraint, field.calculation, field.choiceFilter];
    for (const expr of expressions) {
      if (!expr) continue;
      for (const ref of extractVarRefs(expr)) {
        if (allNames.has(ref) && ref !== name) {
          deps.add(ref);
        }
      }
    }
    graph.set(name, [...deps]);
  });

  return graph;
}

/**
 * Detect all cycles in the dependency graph using DFS.
 * Returns a list of CycleInfo objects, each describing one cycle.
 */
export function detectCycles(
  graph: Map<string, readonly string[]>,
): readonly CycleInfo[] {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;

  const color = new Map<string, number>();
  for (const name of graph.keys()) {
    color.set(name, WHITE);
  }

  const cycles: CycleInfo[] = [];
  const path: string[] = [];
  const visited = new Set<string>();

  function dfs(node: string): void {
    color.set(node, GRAY);
    path.push(node);

    const neighbors = graph.get(node) ?? [];
    for (const neighbor of neighbors) {
      const neighborColor = color.get(neighbor);

      if (neighborColor === GRAY) {
        // Found a cycle — extract it from path
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart >= 0) {
          const cyclePath = [...path.slice(cycleStart), neighbor];
          const cycleKey = [...cyclePath].sort().join(",");
          if (!visited.has(cycleKey)) {
            visited.add(cycleKey);
            // Collect the expressions involved
            const expressions: string[] = [];
            for (let i = 0; i < cyclePath.length - 1; i++) {
              const from = cyclePath[i];
              const to = cyclePath[i + 1];
              expressions.push(`${from} → ${to}`);
            }
            cycles.push({ path: cyclePath, expressions });
          }
        }
      } else if (neighborColor === WHITE) {
        dfs(neighbor);
      }
    }

    path.pop();
    color.set(node, BLACK);
  }

  for (const name of graph.keys()) {
    if (color.get(name) === WHITE) {
      dfs(name);
    }
  }

  return cycles;
}

/**
 * Get the set of all field names that participate in any cycle.
 */
export function getFieldsInCycles(
  cycles: readonly CycleInfo[],
): ReadonlySet<string> {
  const result = new Set<string>();
  for (const cycle of cycles) {
    // Exclude the last element (duplicate of cycle start)
    for (let i = 0; i < cycle.path.length - 1; i++) {
      result.add(cycle.path[i]);
    }
  }
  return result;
}
