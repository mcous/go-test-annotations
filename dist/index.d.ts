interface GoTestAnnotationOptions {
    testResults: string;
}
declare const goTestAnnotations: (options: GoTestAnnotationOptions) => Promise<void>;

export { goTestAnnotations };
