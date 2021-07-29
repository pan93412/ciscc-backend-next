import { MetadataKeys } from "./metadata-keys";

export function BuildMetadataDecorator(
  metadataKey: MetadataKeys,
): (value: string) => MethodDecorator {
  return (value: string) => (_: any, __, descriptor) => {
    if (descriptor.value) {
      Reflect.defineMetadata(metadataKey, value, descriptor.value);
    } else throw new Error("descriptor.value === undefined");
  };
}

export const OnCommand = BuildMetadataDecorator(MetadataKeys.COMMAND);
export const OnEvent = BuildMetadataDecorator(MetadataKeys.EVENT);
