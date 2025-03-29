import { getAnnotations } from './get-annotations.js'
import { annotate, debug } from './log.js'
import { readEvents } from './read-events.js'
import { addEventToSummary, createSuiteSummary } from './suite-summary.js'
import { parseTestEvent } from './test-event.js'

interface GoTestAnnotationOptions {
  testResults: string
}

export const goTestAnnotations = async (
  options: GoTestAnnotationOptions,
): Promise<void> => {
  const rawEvents = readEvents(options.testResults)
  let testSummary = createSuiteSummary()

  for await (const rawEvent of rawEvents) {
    const [error, event] = parseTestEvent(rawEvent)

    if (error) {
      debug(`Unexpected error parsing test event: ${error}`)
    }

    testSummary = addEventToSummary(testSummary, event)
  }

  const annotations = getAnnotations(testSummary)

  for (const annotation of annotations) {
    annotate(annotation)
  }
}
