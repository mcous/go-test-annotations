export { getInput, setFailed } from '@actions/core';

interface GoTestAnnotationOptions {
    testReport: string;
    rerunFailsReport: string;
}
declare const goTestAnnotations: ({ testReport, rerunFailsReport, }: GoTestAnnotationOptions) => Promise<void>;

export { type GoTestAnnotationOptions, goTestAnnotations };
