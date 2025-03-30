import type { TestEvent } from './test-event.js'

type TestStatus = 'unknown' | 'fail'

type PackagesByName = Map<string, TestsByName>

type TestsByName = Map<string, TestSummary>

interface SuiteSummary {
  packages: PackagesByName
}
interface TestSummary {
  status: TestStatus
  output: string[]
}

const createSuiteSummary = (): SuiteSummary => {
  return { packages: new Map() }
}

const createTestsByName = (): TestsByName => {
  return new Map()
}

const createTestSummary = (): TestSummary => {
  return { status: 'unknown', output: [] }
}

const addEventToSummary = (
  summary: SuiteSummary,
  event: TestEvent | undefined,
): SuiteSummary => {
  const {
    Package: packageName,
    Test: testName,
    Output: output,
    Action: action,
  } = event ?? {}

  if (!packageName || !testName) {
    return summary
  }

  const { packages } = summary
  const packageTests = packages.get(packageName) ?? createTestsByName()
  const testSummary = packageTests.get(testName) ?? createTestSummary()

  packages.set(packageName, packageTests)
  packageTests.set(testName, testSummary)

  if (action === 'run') {
    testSummary.output.push('')
  }

  if (output) {
    const previousOutput = testSummary.output.pop() ?? ''
    testSummary.output.push(previousOutput + output)
  }

  if (testSummary.status === 'unknown' && action) {
    if (action === 'pass' || action === 'skip') {
      packageTests.delete(testName)
    } else if (action === 'fail') {
      testSummary.status = 'fail'
    }
  }

  return summary
}

export {
  addEventToSummary,
  createSuiteSummary,
  type PackagesByName,
  type SuiteSummary,
  type TestsByName,
  type TestStatus,
}
