import { debug, error, notice, warning } from '@actions/core'

import type { Annotation } from './annotation.js'

const log = { debug, warning, error, notice }

const annotate = (annotation: Annotation): void => {
  const { level, message, ...props } = annotation
  log[level](message, props)
}

export { annotate, log }
