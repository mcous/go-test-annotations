const { goTestAnnotations, getInput, setFailed } = require('./dist/index.js')

const testResults = getInput('test-results')

goTestAnnotations({ testResults }).catch((error) => {
  setFailed(`Unexpected error adding annotations for Go tests: ${error}`)
})
