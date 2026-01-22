import {
  IsNotEmpty,
  IsOptional,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { applyDecorators } from '@nestjs/common';
import { FIELD_TYPE, VALIDATION_TYPE } from '@common/enums/enums';
import { FIELD_VALIDATOR_REGISTRY } from './field-validator.registry';
import { validationMessage } from '@common/constants/validation.messages';
import { FieldValidatorOptions } from '@common/interfaces/validator.interface';
import { FIELD_TRANSFORMER_REGISTRY } from '@common/decorators/field-validator/field-transformer.registry';

export function FieldValidator(options: FieldValidatorOptions) {
  const decorators: PropertyDecorator[] = [];

  /****
     1) İlk olaraq @Transform işə düşür. Ona görədə ilk o əlavə olunur
     2) Optional bir field olarsa @IsOptional üst tərəfdə olmalıdır
     3) Hər hansı bir şərtdən asılı olarsa @ValidateIf yazılacaq
     4) @ValidateIf true olarsa və ya @ValidateIf olmasa belə type-a uyğun decoratorlar gələcək
     5) Type prop-u gəldikdə @Type decoratoru işə düşür
  ****/

  // Transform decorator
  const transform = FIELD_TRANSFORMER_REGISTRY[options.type];
  decorators.push(transform(options));

  // Optional
  if (options.isOptional) {
    decorators.push(IsOptional());
  }

  // Validate if for conditional situations
  if (options.validateIf) {
    decorators.push(ValidateIf(options.validateIf));
  }

  // Validate nested
  if (options.validateNested) {
    decorators.push(ValidateNested(options.validateNested));
  }

  // Nested types validator (@Types decorator)
  if (options.classType) {
    decorators.push(Type(() => options.classType!));
  }

  // Type decorators
  const validator = FIELD_VALIDATOR_REGISTRY[options.type];

  decorators.push(...validator(options));

  // Required
  if (!options.isOptional) {
    decorators.push(
      IsNotEmpty({
        message: (args) =>
          validationMessage({
            args,
            type: VALIDATION_TYPE.REQUIRED,
          }),
      }),
    );
  }

  if (
    (options.type === FIELD_TYPE.NUMBER ||
      options.type === FIELD_TYPE.STRING) &&
    options.matches
  ) {
    decorators.push(
      Matches(options.matches.regexp, {
        message: (args) =>
          validationMessage({
            args,
            type: options.matches!.message.type,
            params: options.matches?.message.params,
          }),
      }),
    );
  }

  return applyDecorators(...decorators);
}
