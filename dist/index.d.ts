export { getInput, setFailed } from '@actions/core';

interface GoTestAnnotationOptions {
    testResults: string;
}
declare const goTestAnnotations: (options: GoTestAnnotationOptions) => Promise<void>;

export { type GoTestAnnotationOptions, goTestAnnotations };
