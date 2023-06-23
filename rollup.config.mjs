import { nodeResolve } from "@rollup/plugin-node-resolve"
import RollupCommonJsPlugin from "@rollup/plugin-commonjs"
import RollupTypescriptPlugin from "rollup-plugin-typescript2"
import RollupPostCssPlugin from "rollup-plugin-postcss"
import Autoprefixer from "autoprefixer"
import Typescript from "typescript"
import pkg from "./package.json" assert { type: "json" }

export default {
    input: "src/index.ts",
    output: [
        {
            file: "./dist/cjs/index.js",
            format: "cjs",
        },
        {
            file: "./dist/esm/index.js",
            format: "es",
        },
    ],
    external: [...Object.keys(pkg.peerDependencies || {})],
    plugins: [
        nodeResolve(),
        RollupCommonJsPlugin(),
        RollupTypescriptPlugin({
            typescript: Typescript,
        }),
        RollupPostCssPlugin({
            plugins: [Autoprefixer],
        }),
    ],
}
