import fs from 'node:fs'
import os from 'node:os'
import stream from 'node:stream'

import * as v from 'valibot'

import { debug } from './actions-core.js'

type TestEvent = v.InferInput<typeof TestEventSchema>

/** Read `go test`'s NDJSON test report into a stream of test events. */
const readTestReport = (testReport: string): AsyncIterable<TestEvent> => {
  return fs
    .createReadStream(testReport)
    .pipe(new SplitLines())
    .pipe(new ParseLine())
}

class SplitLines extends stream.Transform {
  private buffer: string

  constructor() {
    super()
    this.buffer = ''
  }

  override _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: stream.TransformCallback,
  ) {
    const lines = (this.buffer + chunk.toString()).split(os.EOL)
    this.buffer = lines.pop() ?? ''

    for (const line of lines) {
      this.push(line.trim())
    }

    callback()
  }

  override _flush(callback: stream.TransformCallback) {
    const remaining = this.buffer.trim()
    callback(undefined, remaining || undefined)
    this.buffer = ''
  }
}

class ParseLine extends stream.Transform {
  constructor() {
    super({ readableObjectMode: true })
  }

  override _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: stream.TransformCallback,
  ) {
    const line = chunk.toString()
    const [jsonError, json] = parseJSONLine(line)

    if (jsonError) {
      debug(
        `Unexpected JSON parsing error.${os.EOL}Line: ${line}${os.EOL}Error: ${jsonError}`,
      )
      callback()
      return
    }

    if (!json) {
      callback()
      return
    }

    const [parseError, result] = parseTestEvent(json)

    if (parseError) {
      debug(
        `Unexpected event parsing error.${os.EOL}Line: ${line}${os.EOL}Error: ${parseError}`,
      )
      callback()
      return
    }

    callback(undefined, result)
  }
}

const TestEventSchema = v.object({
  Time: v.exactOptional(v.string()),
  Action: v.exactOptional(
    v.union([
      v.literal('start'),
      v.literal('run'),
      v.literal('pause'),
      v.literal('cont'),
      v.literal('pass'),
      v.literal('bench'),
      v.literal('fail'),
      v.literal('output'),
      v.literal('skip'),
    ]),
  ),
  Package: v.exactOptional(v.string()),
  Test: v.exactOptional(v.string()),
  Elapsed: v.exactOptional(v.number()),
  Output: v.exactOptional(v.string()),
  FailedBuild: v.exactOptional(v.string()),
})

const parseTestEvent = (
  event: unknown,
): [error: Error | undefined, result?: TestEvent] => {
  const result = v.safeParse(TestEventSchema, event)

  if (result.success) {
    return [undefined, result.output]
  }

  return [new v.ValiError<typeof TestEventSchema>(result.issues)]
}

const parseJSONLine = (
  line: string,
): [error: Error | undefined, result?: unknown] => {
  const trimmedLine = line.trim()
  let result: unknown

  try {
    result = trimmedLine ? JSON.parse(trimmedLine) : undefined
  } catch (error) {
    return [error as Error]
  }

  return [undefined, result]
}

export { readTestReport, type TestEvent }
