import type { AnnotationProperties } from '@actions/core'

interface Annotation extends AnnotationProperties {
  level: 'error' | 'warning' | 'notice'
  message: string
}

export type { Annotation }
