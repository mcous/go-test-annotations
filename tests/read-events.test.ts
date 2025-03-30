import fs from 'node:fs/promises'

import { temporaryFileTask } from 'tempy'
import { expect, it as baseIt } from 'vitest'

import * as Subject from '../src/read-events.js'

const it = baseIt.extend<{ temporaryFile: string }>({
  temporaryFile: async ({}, use) => {
    await temporaryFileTask(async (temporaryFile) => {
      await use(temporaryFile)
    })
  },
})

it('reads empty file', async ({ temporaryFile }) => {
  await fs.writeFile(temporaryFile, '', 'utf8')
  const result = Subject.readEvents(temporaryFile)

  await expect(Array.fromAsync(result)).resolves.toEqual([])
})

it('reads multiple empty lines', async ({ temporaryFile }) => {
  await fs.writeFile(temporaryFile, '  \n  \n  \n', 'utf8')
  const result = Subject.readEvents(temporaryFile)

  await expect(Array.fromAsync(result)).resolves.toEqual([])
})

it('reads a single line of JSON', async ({ temporaryFile }) => {
  await fs.writeFile(temporaryFile, '{"hello": "world"}', 'utf8')
  const result = Subject.readEvents(temporaryFile)

  await expect(Array.fromAsync(result)).resolves.toEqual([{ hello: 'world' }])
})

it('reads multiple lines of JSON', async ({ temporaryFile }) => {
  await fs.writeFile(
    temporaryFile,
    '{"hello": "world"}\n{"fizz": "buzz"}',
    'utf8',
  )
  const result = Subject.readEvents(temporaryFile)

  await expect(Array.fromAsync(result)).resolves.toEqual([
    { hello: 'world' },
    { fizz: 'buzz' },
  ])
})

it('reads multiple spares lines of JSON', async ({ temporaryFile }) => {
  await fs.writeFile(
    temporaryFile,
    '{"hello": "world"}\n   \n{"fizz": "buzz"}\n  \n',
    'utf8',
  )
  const result = Subject.readEvents(temporaryFile)

  await expect(Array.fromAsync(result)).resolves.toEqual([
    { hello: 'world' },
    { fizz: 'buzz' },
  ])
})
