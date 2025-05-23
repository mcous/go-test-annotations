import {
  type AnnotationProperties,
  debug,
  error,
  notice,
  warning,
} from '@actions/core'

/** An annotation to be logged with a level and message. */
interface Annotation extends AnnotationProperties {
  level: 'error' | 'warning' | 'notice'
  message: string
}

const log = { debug, warning, error, notice }

/** Log a message, at a given level, to GitHub Actions. */
const annotate = (annotation: Annotation): void => {
  const { level, message, ...props } = annotation
  log[level](message, props)
}

export { annotate, type Annotation, log }
export { debug, getInput, setFailed } from '@actions/core'
