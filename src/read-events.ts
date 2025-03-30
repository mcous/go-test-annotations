import fs from 'node:fs'
import os from 'node:os'
import stream from 'node:stream'

const readEvents = (testReport: string): AsyncIterable<unknown> => {
  return fs.createReadStream(testReport).pipe(new SplitJSONLines())
}

class SplitJSONLines extends stream.Transform {
  private buffer: string

  constructor() {
    super({ readableObjectMode: true })
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
      const [error, data] = parseLine(line)

      if (error) {
        callback(error)
        return
      }

      if (data) {
        this.push(data)
      }
    }

    callback()
  }

  override _flush(callback: stream.TransformCallback) {
    const [error, data] = parseLine(this.buffer)
    callback(error, data)
  }
}

const parseLine = (
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

export { readEvents }
