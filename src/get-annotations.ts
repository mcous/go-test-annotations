import path from 'node:path'

import type { Annotation } from './annotation.js'
import type { Rerun } from './read-rerun-report.js'
import type { SuiteSummary, TestStatus } from './suite-summary.js'

const GITHUB_REPO_RE = /^github\.com\/[^/]+\/[^/]+\//u
const FILENAME_RE = /(?<filename>\S+_test.go):(?<lineNumber>\d+)/iu

const getAnnotations = (
  suiteSummary: SuiteSummary,
  reruns: Rerun[],
): Annotation[] => {
  const annotations: Annotation[] = []

  for (const [packageName, packageSummary] of suiteSummary.packages) {
    const packagePath = getPackagePath(packageName)
    const packageAnnotation = getAnnotationFromOutput(
      packageName,
      packagePath,
      packageSummary.status,
      packageSummary.output,
    )

    if (packageAnnotation) {
      annotations.push(packageAnnotation)
    }

    for (const [testName, testSummary] of packageSummary.tests) {
      const rerun = reruns.find(
        (r) => r.packageName === packageName && r.testName === testName,
      )

      const testAnnotation = getAnnotationFromOutput(
        `${packageName}.${testName}`,
        packagePath,
        testSummary.status,
        testSummary.output,
        rerun,
      )

      if (testAnnotation) {
        annotations.push(testAnnotation)
      }
    }
  }

  return annotations
}

const getPackagePath = (packageName: string): string => {
  return packageName.replace(GITHUB_REPO_RE, '')
}

const getAnnotationFromOutput = (
  name: string,
  packagePath: string,
  status: TestStatus,
  output: string,
  rerun: Rerun | undefined = undefined,
): Annotation | undefined => {
  if (status !== 'fail') {
    return undefined
  }

  const heading = rerun && rerun.runs !== rerun.failures ? 'FLAKY' : 'FAIL'
  const filenameMatch = FILENAME_RE.exec(output)
  const filename = filenameMatch?.groups?.filename
  const lineNumber = filenameMatch?.groups?.lineNumber
  const annotation: Annotation = {
    title: `${heading}: ${name}`,
    message: output,
    level: 'error',
  }

  if (filename && lineNumber) {
    annotation.file = path.join(packagePath, filename)
    annotation.startLine = Number(lineNumber)
  }

  return annotation
}

export { getAnnotations }
