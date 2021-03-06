const Sentry = require('@sentry/browser')
const METAMASK_DEBUG = process.env.METAMASK_DEBUG
const extractEthjsErrorMessage = require('./extractEthjsErrorMessage')
const SENTRY_DSN_PROD = 'https://4420aa8c15c04929ad00ed184f6e4b65@sentry.io/1323015'
const SENTRY_DSN_DEV = 'https://4420aa8c15c04929ad00ed184f6e4b65@sentry.io/1323015'

module.exports = setupSentry

// Setup sentry remote error reporting
function setupSentry (opts) {
  const { release, getState } = opts
  let sentryTarget
  // detect brave
  const isBrave = Boolean(window.chrome.ipcRenderer)

  if (METAMASK_DEBUG) {
    console.log('Setting up Sentry Remote Error Reporting: SENTRY_DSN_DEV')
    sentryTarget = SENTRY_DSN_DEV
  } else {
    console.log('Setting up Sentry Remote Error Reporting: SENTRY_DSN_PROD')
    sentryTarget = SENTRY_DSN_PROD
  }

  Sentry.init({
    dsn: sentryTarget,
    debug: METAMASK_DEBUG,
    release,
    beforeSend: (report) => rewriteReport(report),
  })

  Sentry.configureScope(scope => {
    scope.setExtra('isBrave', isBrave)
  })

  function rewriteReport (report) {
    try {
      // simplify certain complex error messages (e.g. Ethjs)
      simplifyErrorMessages(report)
      // modify report urls
      rewriteReportUrls(report)
      // append app state
      if (getState) {
        const appState = getState()
        report.extra.appState = appState
      }
    } catch (err) {
      console.warn(err)
    }
    return report
  }

  return Sentry
}

function simplifyErrorMessages (report) {
  rewriteErrorMessages(report, (errorMessage) => {
    // simplify ethjs error messages
    errorMessage = extractEthjsErrorMessage(errorMessage)
    // simplify 'Transaction Failed: known transaction'
    if (errorMessage.indexOf('Transaction Failed: known transaction') === 0) {
      // cut the hash from the error message
      errorMessage = 'Transaction Failed: known transaction'
    }
    return errorMessage
  })
}

function rewriteErrorMessages (report, rewriteFn) {
  // rewrite top level message
  if (typeof report.message === 'string') report.message = rewriteFn(report.message)
  // rewrite each exception message
  if (report.exception && report.exception.values) {
    report.exception.values.forEach(item => {
      if (typeof item.value === 'string') item.value = rewriteFn(item.value)
    })
  }
}

function rewriteReportUrls (report) {
  // update request url
  report.request.url = toMetamaskUrl(report.request.url)
  // update exception stack trace
  if (report.exception && report.exception.values) {
    report.exception.values.forEach(item => {
      item.stacktrace.frames.forEach(frame => {
        frame.filename = toMetamaskUrl(frame.filename)
      })
    })
  }
}

function toMetamaskUrl (origUrl) {
  const filePath = origUrl.split(location.origin)[1]
  if (!filePath) return origUrl
  const metamaskUrl = `metamask${filePath}`
  return metamaskUrl
}
