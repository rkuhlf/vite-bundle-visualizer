const { visualizer } = require('rollup-plugin-visualizer')
const Module = require('module')
const fs = require('fs')

const start = ({
  help,
  template = 'treemap',
  open,
  output,
  config,
}) => {
  if (help) {
    return
  }

  // fallback to 'raw-data'
  if (template === 'json') {
    template = 'raw-data'
  }

  // start requiring from cwd's node_modules
  const _module = new Module()
  _module.paths = Module._nodeModulePaths(process.cwd())
  /** @type {import('vite')} */
  const { build } = _module.require('vite')

  let outFile

  if (template === 'raw-data') {
    outFile = output.replace(/\.html$/, '.json')
    open = false
  } else if (template === 'list') {
    outFile = output.replace(/\.html$/, '.yml')
    open = false
  } else {
    outFile = output

    // Only open it if the command is passed an it is an html file.
    if (open) {
      open = output.endsWith('.html')
    }
  }

  build({
    configFile: config,
    plugins: [visualizer({ open, filename: outFile, title: 'Vite Bundle Visualizer', template, brotliSize: true, gzipSize: true })]
  }).then(() => {
    // fix encoding for list template
    if (template === 'list') {
      const tent = Buffer.from(fs.readFileSync(outFile)).toString().replaceAll(' ', '')
      fs.writeFileSync(outFile, tent, { encoding: 'utf-8' });
    }
    console.log(`\nGenerated at ${outFile}`)
  })
}

module.exports = start
