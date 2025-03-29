import * as v from 'valibot'

type TestEvent = v.InferInput<typeof TestEventSchema>

type TestAction = v.InferInput<typeof TestEventSchema>

const TestActionSchema = v.union([
  v.literal('start'),
  v.literal('run'),
  v.literal('pause'),
  v.literal('cont'),
  v.literal('pass'),
  v.literal('bench'),
  v.literal('fail'),
  v.literal('output'),
  v.literal('skip'),
])

const TestEventSchema = v.object({
  Time: v.exactOptional(v.string()),
  Action: v.exactOptional(TestActionSchema),
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

export { parseTestEvent, type TestAction, type TestEvent }
