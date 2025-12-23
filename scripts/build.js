import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const commands = [
  {
    desc: 'Building WASM module...',
    cmd: 'wasm-pack build --target web',
    cwd: path.join(rootDir, 'veil-core'),
  },
  {
    desc: 'Building library...',
    cmd: 'tsup',
    cwd: rootDir,
  },
  {
    desc: 'Building example...',
    cmd: 'pnpm build',
    cwd: path.join(rootDir, 'example'),
  },
]

for (const { desc, cmd, cwd } of commands) {
  console.log(`\n${desc}`)
  try {
    execSync(cmd, {
      cwd,
      stdio: 'inherit',
    })
    console.log(`✓ ${desc}`)
  } catch (error) {
    console.error(`✗ Failed: ${desc}`)
    process.exit(1)
  }
}

console.log('\n✓ All builds completed successfully!')
