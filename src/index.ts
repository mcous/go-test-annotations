import { getAnnotations } from './get-annotations.js'
import { annotate, log } from './log.js'
import { readEvents } from './read-events.js'
import { readRerunReport } from './read-rerun-report.js'
import {
  addEventToSummary,
  createSuiteSummary,
  type SuiteSummary,
} from './suite-summary.js'
import { parseTestEvent } from './test-event.js'

interface GoTestAnnotationOptions {
  testReport: string
  rerunFailsReport: string
}

const goTestAnnotations = async ({
  testReport,
  rerunFailsReport,
}: GoTestAnnotationOptions): Promise<void> => {
  const [suiteSummary, reruns] = await Promise.all([
    buildSuiteSummary(readEvents(testReport)),
    readRerunReport(rerunFailsReport),
  ])

  const annotations = getAnnotations(suiteSummary, reruns)

  for (const annotation of annotations) {
    annotate(annotation)
  }
}

const buildSuiteSummary = async (
  rawEvents: AsyncIterable<unknown>,
): Promise<SuiteSummary> => {
  let summary = createSuiteSummary()

  for await (const rawEvent of rawEvents) {
    const [error, event] = parseTestEvent(rawEvent)

    if (error) {
      log.debug(`Unexpected error parsing test event: ${error}`)
    }

    summary = addEventToSummary(summary, event)
  }

  return summary
}

export { type GoTestAnnotationOptions, goTestAnnotations }
export { getInput, setFailed } from '@actions/core'
