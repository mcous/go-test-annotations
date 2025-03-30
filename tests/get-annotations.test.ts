import os from 'node:os'

import { expect, it } from 'vitest'

import * as Subject from '../src/get-annotations.js'
import { createSuiteSummary } from '../src/suite-summary.js'

it('returns empty array for empty summary', () => {
  const summary = createSuiteSummary()
  const result = Subject.getAnnotations(summary, [])

  expect(result).toEqual([])
})

it('gets annotation for a test failure', () => {
  const summary = createSuiteSummary()
  summary.packages.set(
    'github.com/owner/repo/greet',
    new Map([['wave', { status: 'fail', output: ['oh no!'] }]]),
  )
  const result = Subject.getAnnotations(summary, [])

  expect(result).toEqual([
    {
      title: 'FAIL: github.com/owner/repo/greet.wave',
      message: 'oh no!',
      level: 'error',
    },
  ])
})

it('extracts a test file from a test output', () => {
  const summary = createSuiteSummary()
  summary.packages.set(
    'github.com/owner/repo/greet',
    new Map([
      [
        'wave',
        { status: 'fail', output: ['omg failing_test.go:1337 failed!'] },
      ],
    ]),
  )
  const result = Subject.getAnnotations(summary, [])

  expect(result).toEqual([
    {
      title: 'FAIL: github.com/owner/repo/greet.wave',
      file: 'greet/failing_test.go',
      startLine: 1337,
      message: 'omg failing_test.go:1337 failed!',
      level: 'error',
    },
  ])
})

it('ignores test output without a failed status', () => {
  const summary = createSuiteSummary()
  summary.packages.set(
    'github.com/owner/repo/greet',
    new Map([
      [
        'wave',
        { status: 'unknown', output: ['omg failing_test.go:1337 failed!'] },
      ],
    ]),
  )
  const result = Subject.getAnnotations(summary, [])

  expect(result).toEqual([])
})

it('adds FLAKY TEST to the title if test failed but rerun passed', () => {
  const summary = createSuiteSummary()
  summary.packages.set(
    'github.com/owner/repo/greet',
    new Map([['wave', { status: 'fail', output: ['oh no!'] }]]),
  )

  const result = Subject.getAnnotations(summary, [
    {
      packageName: 'github.com/owner/repo/greet',
      testName: 'wave',
      runs: 2,
      failures: 1,
    },
  ])

  expect(result).toEqual([
    {
      title: 'FLAKY: github.com/owner/repo/greet.wave',
      message: 'oh no!',
      level: 'error',
    },
  ])
})

it('uses default title if failure count matches rerun count', () => {
  const summary = createSuiteSummary()
  summary.packages.set(
    'github.com/owner/repo/greet',
    new Map([['wave', { status: 'fail', output: ['oh no!'] }]]),
  )
  const result = Subject.getAnnotations(summary, [
    {
      packageName: 'github.com/owner/repo/greet',
      testName: 'wave',
      runs: 2,
      failures: 2,
    },
  ])

  expect(result).toEqual([
    {
      title: 'FAIL: github.com/owner/repo/greet.wave',
      message: 'oh no!',
      level: 'error',
    },
  ])
})

it('logs multiple runs', () => {
  const summary = createSuiteSummary()
  summary.packages.set(
    'github.com/owner/repo/greet',
    new Map([['wave', { status: 'fail', output: ['hello', 'world'] }]]),
  )
  const result = Subject.getAnnotations(summary, [])

  expect(result[0]?.message.split(os.EOL)).toEqual([
    'Run 1 of 2',
    'hello',
    'Run 2 of 2',
    'world',
  ])
})
