const core = require('@actions/core')
const { goTestAnnotations } = require('./dist/index.js')

const testResults = core.getInput('test-results')

goTestAnnotations({ testResults }).catch((error) => {
  core.setFailed(`Unexpected error adding annotations for Go tests: ${error}`)
})
