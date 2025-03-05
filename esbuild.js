const esbuild = require("esbuild");

const entryPoints = ["frontend/App.tsx"];
const outdir = "frontend/build";

const args = process.argv.slice(2);
const watch = args.indexOf("--watch") !== -1;

async function build() {
  await esbuild.build({
    entryPoints: entryPoints,
    outdir: outdir,
    bundle: true,
    minify: true,
    plugins: [],
  });
  console.log("⚡ Build complete! ⚡");
}
async function serve() {
  try {
    let ctx = await esbuild.context({
      entryPoints: entryPoints,
      bundle: true,
      outdir: outdir,
    });

    await ctx.watch();

    let { host, port } = await ctx.serve({
      servedir: outdir,
    });

    console.log(`Server running at ${host}:${port}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

build();
if (watch) {
  serve();
}
