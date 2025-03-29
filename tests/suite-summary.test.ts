import { expect, it } from 'vitest'

import * as Subject from '../src/suite-summary.js'

it('creates an empty summary', () => {
  const result = Subject.createSuiteSummary()

  expect(result).toEqual({ packages: new Map() })
})

it('adds package to the summary', () => {
  let result = Subject.createSuiteSummary()
  result = Subject.addEventToSummary(result, { Package: 'greet' })

  expect(result).toEqual({
    packages: new Map([
      ['greet', { status: 'unknown', output: '', tests: new Map() }],
    ]),
  })
})

it('adds test to the summary', () => {
  let result = Subject.createSuiteSummary()
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
  })

  expect(result).toEqual({
    packages: new Map([
      [
        'greet',
        {
          status: 'unknown',
          output: '',
          tests: new Map([['wave', { status: 'unknown', output: '' }]]),
        },
      ],
    ]),
  })
})

it('collects package-level output', () => {
  let result = Subject.createSuiteSummary()
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Output: 'hello',
  })
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Output: 'world',
  })

  expect(result).toEqual({
    packages: new Map([
      ['greet', { status: 'unknown', output: 'helloworld', tests: new Map() }],
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
        {
          status: 'unknown',
          output: '',
          tests: new Map([
            ['wave', { status: 'unknown', output: 'helloworld' }],
          ]),
        },
      ],
    ]),
  })
})

it('removes test on pass', () => {
  let result = Subject.createSuiteSummary()
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Output: 'hello',
  })
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Test: 'wave',
    Action: 'pass',
  })

  expect(result).toEqual({
    packages: new Map([
      ['greet', { status: 'unknown', output: '', tests: new Map() }],
    ]),
  })
})

it.each(['pass', 'skip'] as const)('removes package on %s', (action) => {
  let result = Subject.createSuiteSummary()
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Output: 'hello',
  })
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Action: action,
  })

  expect(result).toEqual({
    packages: new Map(),
  })
})

it('marks package as failed', () => {
  let result = Subject.createSuiteSummary()
  result = Subject.addEventToSummary(result, {
    Package: 'greet',
    Action: 'fail',
  })

  expect(result).toEqual({
    packages: new Map([
      ['greet', { status: 'fail', output: '', tests: new Map() }],
    ]),
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
      [
        'greet',
        {
          status: 'unknown',
          output: '',
          tests: new Map([['wave', { status: 'fail', output: '' }]]),
        },
      ],
    ]),
  })
})
