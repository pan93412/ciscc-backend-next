export type Depromise<T> = T extends Promise<infer DPT> ? DPT : never;
