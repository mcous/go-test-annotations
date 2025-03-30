import { expect, it } from 'vitest'

import * as Subject from '../src/suite-summary.js'

it('creates an empty summary', () => {
  const result = Subject.createSuiteSummary()

  expect(result).toEqual({ packages: new Map() })
})

it('adds test to the summary', () => {
  let result = Subject.createSuiteSummary()
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Action: 'run',
  })

  expect(result).toEqual({
    packages: new Map([
      ['greet', new Map([['wave', { status: 'unknown', output: [''] }]])],
    ]),
  })
})

it('collects test-level output', () => {
  let result = Subject.createSuiteSummary()
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Output: 'hello',
  })
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Output: 'world',
  })

  expect(result).toEqual({
    packages: new Map([
      [
        'greet',
        new Map([['wave', { status: 'unknown', output: ['helloworld'] }]]),
      ],
    ]),
  })
})

it.each(['pass', 'skip'] as const)('removes test on %s', (action) => {
  let result = Subject.createSuiteSummary()
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Output: 'hello',
  })
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Action: action,
  })

  expect(result).toEqual({
    packages: new Map([['greet', new Map()]]),
  })
})

it('marks test as failed', () => {
  let result = Subject.createSuiteSummary()
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Action: 'fail',
  })

  expect(result).toEqual({
    packages: new Map([
      ['greet', new Map([['wave', { status: 'fail', output: [] }]])],
    ]),
  })
})

it('does not delete a failed test, even if it passes later', () => {
  let result = Subject.createSuiteSummary()
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Action: 'fail',
  })
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Action: 'pass',
  })

  expect(result).toEqual({
    packages: new Map([
      ['greet', new Map([['wave', { status: 'fail', output: [] }]])],
    ]),
  })
})

it('adds a new entry to output if test re-runs', () => {
  let result = Subject.createSuiteSummary()
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Action: 'run',
  })
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Output: 'hello',
  })
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Action: 'run',
  })
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Output: 'world',
  })

  expect(result).toEqual({
    packages: new Map([
      [
        'greet',
        new Map([['wave', { status: 'unknown', output: ['hello', 'world'] }]]),
      ],
    ]),
  })
})
