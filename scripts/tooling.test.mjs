import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const vp = join(dirname(fileURLToPath(import.meta.resolve("vite-plus/package.json"))), "bin/vp");

/** Runs the project-local CLI with a timeout and returns its status and diagnostics. */
function runVp(args, { cwd = root } = {}) {
  const result = spawnSync(process.execPath, [vp, ...args], {
    cwd,
    encoding: "utf8",
    timeout: 30_000,
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null, result.stderr);
  return { status: result.status, output: result.stdout + result.stderr };
}

test("Vite+ rejects lint errors and formatting drift, then accepts formatted files", () => {
  const fixtureDir = mkdtempSync(join(root, "scripts/tooling-fixture-"));

  try {
    const lintFile = join(fixtureDir, "lint.ts");
    writeFileSync(lintFile, "export const unused = 1;\ndebugger;\n");
    const lint = runVp(["lint", lintFile]);
    assert.equal(lint.status, 1, lint.output);
    assert.match(lint.output, /no-debugger/);

    const astroLintFile = join(fixtureDir, "lint.astro");
    writeFileSync(astroLintFile, "<h1>VirtusWay</h1>\n<script>debugger;</script>\n");
    const astroLint = runVp(["lint", astroLintFile]);
    assert.equal(astroLint.status, 1, astroLint.output);
    assert.match(astroLint.output, /no-debugger/);

    const formatFiles = [
      ["format.ts", 'export const data={name:"VirtusWay",enabled:true};\n'],
      ["format.astro", '---\nconst title="VirtusWay"\n---\n<h1 class="heading">{title}</h1>'],
      ["format.css", ".heading{color:red;margin:0}\n"],
    ].map(([name, content]) => {
      const file = join(fixtureDir, name);
      writeFileSync(file, content);
      return file;
    });

    const check = runVp(["fmt", "--check", ...formatFiles]);
    assert.equal(check.status, 1, check.output);
    for (const file of formatFiles) {
      assert.ok(check.output.includes(basename(file)), check.output);
    }

    const combinedLint = runVp(["check", lintFile]);
    assert.equal(combinedLint.status, 1, combinedLint.output);
    assert.match(combinedLint.output, /no-debugger/);

    const combinedFormat = runVp(["check", ...formatFiles]);
    assert.equal(combinedFormat.status, 1, combinedFormat.output);

    const format = runVp(["fmt", ...formatFiles]);
    assert.equal(format.status, 0, format.output);
    const formattedContents = formatFiles.map((file) => readFileSync(file, "utf8"));

    const clean = runVp(["check", ...formatFiles]);
    assert.equal(clean.status, 0, clean.output);

    const repeat = runVp(["fmt", ...formatFiles]);
    assert.equal(repeat.status, 0, repeat.output);
    assert.deepEqual(
      formatFiles.map((file) => readFileSync(file, "utf8")),
      formattedContents,
      "Formatting must be idempotent",
    );
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});

test("the project check script rejects warning-only lint results", () => {
  const fixtureDir = mkdtempSync(join(tmpdir(), "virtusway-tooling-warning-"));
  const { scripts } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

  try {
    symlinkSync(join(root, "node_modules"), join(fixtureDir, "node_modules"), "junction");
    writeFileSync(join(fixtureDir, ".gitignore"), "node_modules/\n.astro/\n");
    writeFileSync(join(fixtureDir, "package.json"), '{"type":"module"}\n');
    writeFileSync(
      join(fixtureDir, "vite.config.ts"),
      'import { defineConfig } from "vite-plus";\n\n' +
        'export default defineConfig({ lint: { categories: { correctness: "warn" } }, fmt: {} });\n',
    );
    writeFileSync(join(fixtureDir, "warning.ts"), "debugger;\n");

    const format = runVp(["fmt"], { cwd: fixtureDir });
    assert.equal(format.status, 0, format.output);

    const lint = runVp(["lint"], { cwd: fixtureDir });
    assert.equal(lint.status, 0, lint.output);
    assert.match(lint.output, /warning/i);
    assert.match(lint.output, /no-debugger/);

    // Execute the actual package script without invoking a package-manager install.
    const check = spawnSync(scripts.check, {
      cwd: fixtureDir,
      shell: true,
      encoding: "utf8",
      timeout: 30_000,
      env: {
        ...process.env,
        PATH: `${join(root, "node_modules/.bin")}${delimiter}${process.env.PATH}`,
      },
    });
    assert.ifError(check.error);
    assert.equal(check.signal, null, check.stderr);
    const output = check.stdout + check.stderr;
    assert.equal(check.status, 1, output);
    assert.match(output, /warning/i);
    assert.match(output, /no-debugger/);
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});
