const fs = require('fs')
const path = require('path')

const workspaceRoot = path.resolve(__dirname, '../../..')
const walletConnectCoreRoot = path.join(workspaceRoot, 'node_modules', '@walletconnect', 'core')

const log = (message) => console.log(`[patch-viem] ${message}`)

const viemRoots = [
  path.join(workspaceRoot, 'node_modules', 'viem'),
  path.join(workspaceRoot, 'apps', 'web', 'node_modules', 'viem'),
].filter((dir, index, roots) => fs.existsSync(dir) && roots.indexOf(dir) === index)

const wagmiCoreRoots = [
  path.join(workspaceRoot, 'node_modules', '@wagmi', 'core'),
  path.join(workspaceRoot, 'apps', 'web', 'node_modules', '@wagmi', 'core'),
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

patchFile(path.join(walletConnectCoreRoot, 'dist', 'index.es.js'), [
  {
    marker: 'WalletConnect compatibility exports for older Next builds.',
    text: [
      '// WalletConnect compatibility exports for older Next builds.',
      'const __wcEventTraceProxy = new Proxy({}, { get: (_target, prop) => String(prop) });',
      'export const TRANSPORT_TYPES = { relay: "relay", link_mode: "link_mode" };',
      'export const PAIRING_EVENTS = { create: "pairing_create", update: "pairing_update", delete: "pairing_delete", expire: "pairing_expire" };',
      'export const VERIFY_SERVER = "https://verify.walletconnect.com";',
      'export const EVENT_CLIENT_SESSION_TRACES = __wcEventTraceProxy;',
      'export const EVENT_CLIENT_SESSION_ERRORS = __wcEventTraceProxy;',
      'export const EVENT_CLIENT_AUTHENTICATE_TRACES = __wcEventTraceProxy;',
      'export const EVENT_CLIENT_AUTHENTICATE_ERRORS = __wcEventTraceProxy;',
      'export const EVENT_CLIENT_PAIRING_TRACES = __wcEventTraceProxy;',
      'export const EVENT_CLIENT_PAIRING_ERRORS = __wcEventTraceProxy;',
    ].join('\n'),
  },
])

patchFile(path.join(walletConnectCoreRoot, 'dist', 'index.cjs.js'), [
  {
    marker: 'exports.EVENT_CLIENT_PAIRING_ERRORS = __wcEventTraceProxy;',
    text: [
      '// WalletConnect compatibility exports for older Next builds.',
      'const __wcEventTraceProxy = new Proxy({}, { get: (_target, prop) => String(prop) });',
      'exports.TRANSPORT_TYPES = { relay: "relay", link_mode: "link_mode" };',
      'exports.PAIRING_EVENTS = { create: "pairing_create", update: "pairing_update", delete: "pairing_delete", expire: "pairing_expire" };',
      'exports.VERIFY_SERVER = "https://verify.walletconnect.com";',
      'exports.EVENT_CLIENT_SESSION_TRACES = __wcEventTraceProxy;',
      'exports.EVENT_CLIENT_SESSION_ERRORS = __wcEventTraceProxy;',
      'exports.EVENT_CLIENT_AUTHENTICATE_TRACES = __wcEventTraceProxy;',
      'exports.EVENT_CLIENT_AUTHENTICATE_ERRORS = __wcEventTraceProxy;',
      'exports.EVENT_CLIENT_PAIRING_TRACES = __wcEventTraceProxy;',
      'exports.EVENT_CLIENT_PAIRING_ERRORS = __wcEventTraceProxy;',
    ].join('\n'),
  },
])

log('done')
