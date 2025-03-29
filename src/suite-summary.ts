import type { TestEvent } from './test-event.js'

type TestStatus = 'unknown' | 'fail'

interface SuiteSummary {
  packages: Map<string, PackageSummary>
}

interface PackageSummary {
  status: TestStatus
  output: string
  tests: Map<string, TestSummary>
}

interface TestSummary {
  status: TestStatus
  output: string
}

const createSuiteSummary = (): SuiteSummary => {
  return { packages: new Map() }
}

const createPackageSummary = (): PackageSummary => {
  return { status: 'unknown', output: '', tests: new Map() }
}

const createTestSummary = (): TestSummary => {
  return { status: 'unknown', output: '' }
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
  let packageSummary: PackageSummary | undefined
  let testSummary: TestSummary | undefined

  if (packageName) {
    packageSummary = summary.packages.get(packageName) ?? createPackageSummary()
    summary.packages.set(packageName, packageSummary)
  }

  if (packageSummary && testName) {
    testSummary = packageSummary.tests.get(testName) ?? createTestSummary()
    packageSummary.tests.set(testName, testSummary)
  }

  if (output) {
    if (testSummary) {
      testSummary.output += output
    } else if (packageSummary) {
      packageSummary.output += output
    }
  }

  if (action === 'pass' || action === 'skip') {
    if (packageSummary && testName) {
      packageSummary.tests.delete(testName)
    } else if (packageName) {
      summary.packages.delete(packageName)
    }
  } else if (action === 'fail') {
    if (testSummary) {
      testSummary.status = 'fail'
    } else if (packageSummary) {
      packageSummary.status = 'fail'
    }
  }

  return summary
}

export {
  addEventToSummary,
  createSuiteSummary,
  type PackageSummary,
  type SuiteSummary,
  type TestStatus,
  type TestSummary,
}
