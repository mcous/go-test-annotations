const { goTestAnnotations, getInput, setFailed } = require('./dist/index.js')

const testReport = getInput('test-report')
const rerunFailsReport = getInput('rerun-fails-report')

goTestAnnotations({ testReport, rerunFailsReport }).catch((error) => {
  setFailed(`Unexpected error adding annotations for Go tests: ${error}`)
})
