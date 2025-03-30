import fs from 'node:fs/promises'
import os from 'node:os'

interface Rerun {
  packageName: string
  testName: string
  runs: number
  failures: number
}

const RERUN_RE =
  /^(?<packageName>[\w./]+)\.(?<testName>[\w./]+): (?<runs>\d+) runs, (?<failures>\d+) failures$/

const readRerunReport = async (rerunReport: string): Promise<Rerun[]> => {
  if (rerunReport === '') {
    return []
  }

  const report = await fs.readFile(rerunReport, 'utf8')

  return report.split(os.EOL).flatMap((line) => {
    const groups = RERUN_RE.exec(line.trim())?.groups ?? {}
    const { packageName, testName, runs, failures } = groups

    return packageName && testName && runs && failures
      ? {
          packageName,
          testName,
          runs: Number(runs),
          failures: Number(failures),
        }
      : []
  })
}

export { readRerunReport, type Rerun }
