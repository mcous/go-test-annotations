import * as core from '@actions/core'

import type { Annotation } from './annotation.js'

const annotate = (annotation: Annotation): void => {
  const { level, message, ...props } = annotation
  core[level](message, props)
}

const debug = (message: string): void => {
  core.debug(message)
}

export { annotate, debug }
