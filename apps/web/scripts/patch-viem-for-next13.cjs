const fs = require('fs')
const path = require('path')

const workspaceRoot = path.resolve(__dirname, '../../..')
const walletConnectCoreRoots = [
  path.join(workspaceRoot, 'node_modules', '@walletconnect', 'core'),
  path.join(workspaceRoot, 'apps', 'web', 'node_modules', '@walletconnect', 'core'),
  path.join(workspaceRoot, 'node_modules', '@wagmi', 'connectors', 'node_modules', '@walletconnect', 'core'),
  path.join(
    workspaceRoot,
    'apps',
    'web',
    'node_modules',
    '@wagmi',
    'connectors',
    'node_modules',
    '@walletconnect',
    'core',
  ),
].filter((dir, index, roots) => fs.existsSync(dir) && roots.indexOf(dir) === index)

const log = (message) => console.log(`[patch-viem] ${message}`)

const viemRoots = [
  path.join(workspaceRoot, 'node_modules', 'viem'),
  path.join(workspaceRoot, 'apps', 'web', 'node_modules', 'viem'),
].filter((dir, index, roots) => fs.existsSync(dir) && roots.indexOf(dir) === index)

const oxRoots = [
  path.join(workspaceRoot, 'node_modules', 'ox'),
  path.join(workspaceRoot, 'node_modules', 'viem', 'node_modules', 'ox'),
  path.join(workspaceRoot, 'node_modules', '@base-org', 'account', 'node_modules', 'viem', 'node_modules', 'ox'),
  path.join(workspaceRoot, 'node_modules', '@coinbase', 'cdp-sdk', 'node_modules', 'ox'),
  path.join(workspaceRoot, 'node_modules', '@reown', 'appkit', 'node_modules', 'ox'),
  path.join(workspaceRoot, 'node_modules', '@reown', 'appkit-common', 'node_modules', 'ox'),
  path.join(workspaceRoot, 'node_modules', '@reown', 'appkit-controllers', 'node_modules', 'ox'),
  path.join(workspaceRoot, 'node_modules', '@reown', 'appkit-utils', 'node_modules', 'ox'),
  path.join(workspaceRoot, 'node_modules', '@safe-global', 'safe-apps-sdk', 'node_modules', 'ox'),
  path.join(workspaceRoot, 'apps', 'web', 'node_modules', 'ox'),
  path.join(workspaceRoot, 'apps', 'web', 'node_modules', 'viem', 'node_modules', 'ox'),
  path.join(workspaceRoot, 'apps', 'web', 'node_modules', '@reown', 'appkit', 'node_modules', 'ox'),
  path.join(workspaceRoot, 'apps', 'web', 'node_modules', '@reown', 'appkit-common', 'node_modules', 'ox'),
  path.join(workspaceRoot, 'apps', 'web', 'node_modules', '@reown', 'appkit-controllers', 'node_modules', 'ox'),
  path.join(workspaceRoot, 'apps', 'web', 'node_modules', '@reown', 'appkit-utils', 'node_modules', 'ox'),
].filter((dir, index, roots) => fs.existsSync(dir) && roots.indexOf(dir) === index)

const wagmiCoreRoots = [
  path.join(workspaceRoot, 'node_modules', '@wagmi', 'core'),
  path.join(workspaceRoot, 'apps', 'web', 'node_modules', '@wagmi', 'core'),
].filter((dir, index, roots) => fs.existsSync(dir) && roots.indexOf(dir) === index)

const reownWagmiAdapterRoots = [
  path.join(workspaceRoot, 'node_modules', '@reown', 'appkit-adapter-wagmi'),
  path.join(workspaceRoot, 'apps', 'web', 'node_modules', '@reown', 'appkit-adapter-wagmi'),
].filter((dir, index, roots) => fs.existsSync(dir) && roots.indexOf(dir) === index)

const keepTsRoots = new Set(['_types', '_esm', '_cjs'])

function removeSourceTs(viemRoot, dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    const relative = path.relative(viemRoot, fullPath)
    const firstSegment = relative.split(path.sep)[0]

    if (entry.isDirectory()) {
      removeSourceTs(viemRoot, fullPath)
      continue
    }

    if (entry.isFile() && path.extname(entry.name) === '.ts' && !keepTsRoots.has(firstSegment)) {
      fs.unlinkSync(fullPath)
    }
  }
}

function patchFile(filePath, patches) {
  if (!fs.existsSync(filePath)) return

  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  for (const { marker, text } of patches) {
    if (!content.includes(marker)) {
      const sourceMapComment = '//# sourceMappingURL=index.js.map'
      content = content.includes(sourceMapComment)
        ? content.replace(sourceMapComment, `${text}\n${sourceMapComment}`)
        : `${content.trimEnd()}\n${text}\n`
      changed = true
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content)
    log(`patched ${path.relative(workspaceRoot, filePath)}`)
  }
}

function overwriteFile(filePath, content) {
  if (!fs.existsSync(filePath)) return

  const current = fs.readFileSync(filePath, 'utf8')
  if (current === content) return

  fs.writeFileSync(filePath, content)
  log(`patched ${path.relative(workspaceRoot, filePath)}`)
}

function hasEsmExport(content, exportName) {
  return (
    new RegExp(`export\\s+const\\s+${exportName}\\b`).test(content) ||
    new RegExp(`export\\s*\\{[^}]*\\b(?:\\w+\\s+as\\s+)?${exportName}\\b[^}]*\\}`).test(content)
  )
}

function patchWalletConnectEsm(filePath) {
  if (!fs.existsSync(filePath)) return

  const previousBlockPattern =
    /\n?\/\/ WalletConnect compatibility exports for older Next builds\.\nconst __wcEventTraceProxy = new Proxy\(\{\}, \{ get: \(_target, prop\) => String\(prop\) \}\);\n(?:export const (?:TRANSPORT_TYPES|PAIRING_EVENTS|VERIFY_SERVER|EVENT_CLIENT_SESSION_TRACES|EVENT_CLIENT_SESSION_ERRORS|EVENT_CLIENT_AUTHENTICATE_TRACES|EVENT_CLIENT_AUTHENTICATE_ERRORS|EVENT_CLIENT_PAIRING_TRACES|EVENT_CLIENT_PAIRING_ERRORS) = [^\n]+;\n?)+/g
  let content = fs.readFileSync(filePath, 'utf8').replace(previousBlockPattern, '\n')

  const missingExports = [
    ['TRANSPORT_TYPES', '{ relay: "relay", link_mode: "link_mode" }'],
    [
      'PAIRING_EVENTS',
      '{ create: "pairing_create", update: "pairing_update", delete: "pairing_delete", expire: "pairing_expire" }',
    ],
    ['VERIFY_SERVER', '"https://verify.walletconnect.com"'],
    ['EVENT_CLIENT_SESSION_TRACES', '__wcEventTraceProxy'],
    ['EVENT_CLIENT_SESSION_ERRORS', '__wcEventTraceProxy'],
    ['EVENT_CLIENT_AUTHENTICATE_TRACES', '__wcEventTraceProxy'],
    ['EVENT_CLIENT_AUTHENTICATE_ERRORS', '__wcEventTraceProxy'],
    ['EVENT_CLIENT_PAIRING_TRACES', '__wcEventTraceProxy'],
    ['EVENT_CLIENT_PAIRING_ERRORS', '__wcEventTraceProxy'],
  ].filter(([exportName]) => !hasEsmExport(content, exportName))

  if (missingExports.length > 0) {
    const needsProxy = missingExports.some(([, value]) => value === '__wcEventTraceProxy')
    const text = [
      '// WalletConnect compatibility exports for older Next builds.',
      ...(needsProxy ? ['const __wcEventTraceProxy = new Proxy({}, { get: (_target, prop) => String(prop) });'] : []),
      ...missingExports.map(([exportName, value]) => `export const ${exportName} = ${value};`),
    ].join('\n')
    const sourceMapComment = '//# sourceMappingURL=index.es.js.map'
    content = content.includes(sourceMapComment)
      ? content.replace(sourceMapComment, `${text}\n${sourceMapComment}`)
      : `${content.trimEnd()}\n${text}\n`
  }

  const current = fs.readFileSync(filePath, 'utf8')
  if (content !== current) {
    fs.writeFileSync(filePath, content)
    log(`patched ${path.relative(workspaceRoot, filePath)}`)
  }
}

function patchWalletConnectCjs(filePath) {
  if (!fs.existsSync(filePath)) return

  const previousBlockPattern =
    /\n?\/\/ WalletConnect compatibility exports for older Next builds\.\nconst __wcEventTraceProxy = new Proxy\(\{\}, \{ get: \(_target, prop\) => String\(prop\) \}\);\n(?:exports\.(?:TRANSPORT_TYPES|PAIRING_EVENTS|VERIFY_SERVER|EVENT_CLIENT_SESSION_TRACES|EVENT_CLIENT_SESSION_ERRORS|EVENT_CLIENT_AUTHENTICATE_TRACES|EVENT_CLIENT_AUTHENTICATE_ERRORS|EVENT_CLIENT_PAIRING_TRACES|EVENT_CLIENT_PAIRING_ERRORS) = [^\n]+;\n?)+/g
  let content = fs.readFileSync(filePath, 'utf8').replace(previousBlockPattern, '\n')

  const missingExports = [
    ['TRANSPORT_TYPES', '{ relay: "relay", link_mode: "link_mode" }'],
    [
      'PAIRING_EVENTS',
      '{ create: "pairing_create", update: "pairing_update", delete: "pairing_delete", expire: "pairing_expire" }',
    ],
    ['VERIFY_SERVER', '"https://verify.walletconnect.com"'],
    ['EVENT_CLIENT_SESSION_TRACES', '__wcEventTraceProxy'],
    ['EVENT_CLIENT_SESSION_ERRORS', '__wcEventTraceProxy'],
    ['EVENT_CLIENT_AUTHENTICATE_TRACES', '__wcEventTraceProxy'],
    ['EVENT_CLIENT_AUTHENTICATE_ERRORS', '__wcEventTraceProxy'],
    ['EVENT_CLIENT_PAIRING_TRACES', '__wcEventTraceProxy'],
    ['EVENT_CLIENT_PAIRING_ERRORS', '__wcEventTraceProxy'],
  ].filter(([exportName]) => !new RegExp(`exports\\.${exportName}\\b`).test(content))

  if (missingExports.length > 0) {
    const needsProxy = missingExports.some(([, value]) => value === '__wcEventTraceProxy')
    content = `${content.trimEnd()}\n${[
      '// WalletConnect compatibility exports for older Next builds.',
      ...(needsProxy ? ['const __wcEventTraceProxy = new Proxy({}, { get: (_target, prop) => String(prop) });'] : []),
      ...missingExports.map(([exportName, value]) => `exports.${exportName} = ${value};`),
    ].join('\n')}\n`
  }

  const current = fs.readFileSync(filePath, 'utf8')
  if (content !== current) {
    fs.writeFileSync(filePath, content)
    log(`patched ${path.relative(workspaceRoot, filePath)}`)
  }
}

function patchReownWagmiAdapterHelpers(filePath) {
  if (!fs.existsSync(filePath)) return

  let content = fs.readFileSync(filePath, 'utf8')

  content = content.replace(
    /export async function getSafeConnector\(connectors\) \{[\s\S]*?\n\}/,
    [
      'export async function getSafeConnector() {',
      '    return null;',
      '}',
    ].join('\n'),
  )

  content = content.replace(
    /export async function getCoinbaseConnector\(connectors\) \{[\s\S]*?\n\}/,
    [
      'export async function getCoinbaseConnector() {',
      '    return null;',
      '}',
    ].join('\n'),
  )

  content = content.replace("import { CoreHelperUtil } from '@reown/appkit-controllers';\n", '')

  const current = fs.readFileSync(filePath, 'utf8')
  if (content !== current) {
    fs.writeFileSync(filePath, content)
    log(`patched ${path.relative(workspaceRoot, filePath)}`)
  }
}

if (viemRoots.length === 0) log('node_modules/viem not found, skipping viem patch')

for (const viemRoot of viemRoots) {
  removeSourceTs(viemRoot, viemRoot)

  patchFile(path.join(viemRoot, '_esm', 'actions', 'index.js'), [
    {
      marker: 'sendCallsSync is not available in this viem build.',
      text: [
        "export { getCapabilities, getCallsStatus, sendCalls, showCallsStatus } from '../experimental/index.js';",
        'export async function sendCallsSync() {',
        "    throw new Error('sendCallsSync is not available in this viem build.');",
        '}',
        'export async function sendTransactionSync() {',
        "    throw new Error('sendTransactionSync is not available in this viem build.');",
        '}',
        'export async function waitForCallsStatus() {',
        "    throw new Error('waitForCallsStatus is not available in this viem build.');",
        '}',
      ].join('\n'),
    },
  ])

  patchFile(path.join(viemRoot, '_esm', 'experimental', 'index.js'), [
    {
      marker: 'waitForCallsStatus is not available in this viem build.',
      text: [
        'export async function waitForCallsStatus() {',
        "    throw new Error('waitForCallsStatus is not available in this viem build.');",
        '}',
      ].join('\n'),
    },
  ])

  patchFile(path.join(viemRoot, '_cjs', 'actions', 'index.js'), [
    {
      marker: 'exports.sendCallsSync = sendCallsSync;',
      text: [
        'var experimental_js_1 = require("../experimental/index.js");',
        'Object.defineProperty(exports, "getCapabilities", { enumerable: true, get: function () { return experimental_js_1.getCapabilities; } });',
        'Object.defineProperty(exports, "getCallsStatus", { enumerable: true, get: function () { return experimental_js_1.getCallsStatus; } });',
        'Object.defineProperty(exports, "sendCalls", { enumerable: true, get: function () { return experimental_js_1.sendCalls; } });',
        'Object.defineProperty(exports, "showCallsStatus", { enumerable: true, get: function () { return experimental_js_1.showCallsStatus; } });',
        'async function sendCallsSync() {',
        "    throw new Error('sendCallsSync is not available in this viem build.');",
        '}',
        'exports.sendCallsSync = sendCallsSync;',
        'async function sendTransactionSync() {',
        "    throw new Error('sendTransactionSync is not available in this viem build.');",
        '}',
        'exports.sendTransactionSync = sendTransactionSync;',
        'async function waitForCallsStatus() {',
        "    throw new Error('waitForCallsStatus is not available in this viem build.');",
        '}',
        'exports.waitForCallsStatus = waitForCallsStatus;',
      ].join('\n'),
    },
  ])

  patchFile(path.join(viemRoot, '_cjs', 'experimental', 'index.js'), [
    {
      marker: 'exports.waitForCallsStatus = waitForCallsStatus;',
      text: [
        'async function waitForCallsStatus() {',
        "    throw new Error('waitForCallsStatus is not available in this viem build.');",
        '}',
        'exports.waitForCallsStatus = waitForCallsStatus;',
      ].join('\n'),
    },
  ])
}

if (oxRoots.length === 0) log('node_modules/ox not found, skipping ox patch')

for (const oxRoot of oxRoots) {
  removeSourceTs(oxRoot, oxRoot)
}

if (wagmiCoreRoots.length === 0) log('node_modules/@wagmi/core not found, skipping wagmi core patch')

const unsupportedEip5792Actions = [
  'getCallsStatus',
  'getCapabilities',
  'sendCalls',
  'sendCallsSync',
  'sendTransactionSync',
  'showCallsStatus',
  'waitForCallsStatus',
]

for (const wagmiCoreRoot of wagmiCoreRoots) {
  for (const actionName of unsupportedEip5792Actions) {
    overwriteFile(
      path.join(wagmiCoreRoot, 'dist', 'esm', 'actions', `${actionName}.js`),
      [
        `/** ${actionName} requires EIP-5792 viem actions that are not available in this build. */`,
        `export async function ${actionName}() {`,
        `    throw new Error('${actionName} is not available in this viem build.');`,
        '}',
        `//# sourceMappingURL=${actionName}.js.map`,
        '',
      ].join('\n'),
    )

    overwriteFile(
      path.join(wagmiCoreRoot, 'dist', 'cjs', 'actions', `${actionName}.js`),
      [
        '"use strict";',
        'Object.defineProperty(exports, "__esModule", { value: true });',
        `exports.${actionName} = ${actionName};`,
        `/** ${actionName} requires EIP-5792 viem actions that are not available in this build. */`,
        `async function ${actionName}() {`,
        `    throw new Error('${actionName} is not available in this viem build.');`,
        '}',
        `//# sourceMappingURL=${actionName}.js.map`,
        '',
      ].join('\n'),
    )
  }
}

if (walletConnectCoreRoots.length === 0) log('node_modules/@walletconnect/core not found, skipping walletconnect patch')

for (const walletConnectCoreRoot of walletConnectCoreRoots) {
  patchWalletConnectEsm(path.join(walletConnectCoreRoot, 'dist', 'index.es.js'))
  patchWalletConnectCjs(path.join(walletConnectCoreRoot, 'dist', 'index.cjs.js'))
}

if (reownWagmiAdapterRoots.length === 0) log('node_modules/@reown/appkit-adapter-wagmi not found, skipping reown patch')

for (const reownWagmiAdapterRoot of reownWagmiAdapterRoots) {
  patchReownWagmiAdapterHelpers(path.join(reownWagmiAdapterRoot, 'dist', 'esm', 'src', 'utils', 'helpers.js'))
}

log('done')
