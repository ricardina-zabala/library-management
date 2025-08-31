import { getProduct, getProductsList } from "./example-usecase/index.js";

export interface UseCaseDeclaration {
  useCase: (deps: any, payload: any) => Promise<unknown>;
  enable: boolean;
}

export const domainUseCases = {
  getProduct: {
    useCase: getProduct,
    enable: false,
  },
  getProductsList: {
    useCase: getProductsList,
    enable: true,
  },
} as const satisfies Record<string, UseCaseDeclaration>;

export type UseCaseTypes =
  (typeof domainUseCases)[keyof typeof domainUseCases]["useCase"];

export const USE_CASE_NAME = Object.keys(domainUseCases).reduce((acc, key) => {
  acc[key] = key;
  return acc;
}, {} as Record<string, string>) as Record<
  keyof typeof domainUseCases,
  keyof typeof domainUseCases
>;

export type UseCaseName = (typeof USE_CASE_NAME)[keyof typeof USE_CASE_NAME];

export type UseCaseType<TEndpointName extends UseCaseName> =
  (typeof domainUseCases)[TEndpointName]["useCase"];
