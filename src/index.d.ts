export declare class ModuleExporter {
  __exports: {
    __test: object,
    __exportsToClient: object
  };
  __class: object;

  constructor();
  $$public(fn: Function, name?: string): void;
  $$private(fn: Function, name?: string): void;
  $$client(fn: Function, name?: string): void;
  $$class(fn: Function): void;
  $$getExports(): object;
}