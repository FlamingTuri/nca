import { PositionalArgument } from "../model/positional-argument";
import { PositionalArgumentType } from "../model/positional-argument-type";
import { DuplicatesValidator } from "./duplicates-validator";
import { WhiteSpaceValidator } from "./white-space-validator";

export class PositionalArgumentValidator {

  static validate(aliasName: string, positionalArguments?: PositionalArgument[]) {
    if (positionalArguments) {
      this.checkNamesFormat(aliasName, positionalArguments);
      this.checkDuplicateNames(aliasName, positionalArguments);
      this.checkMultipleListPositionalArguments(aliasName, positionalArguments);
    }
  }

  private static checkNamesFormat(aliasName: string, positionalArguments: PositionalArgument[]) {
    const positionalArgumentNames = this.getPositionalArgumentNames(positionalArguments);
    WhiteSpaceValidator.validate(positionalArgumentNames, elementsWithWhitespaces => {
      return `${aliasName}: positional argument names cannot contain whitespaces ` +
        `[${elementsWithWhitespaces}]`;
    });
  }

  private static checkDuplicateNames(aliasName: string, positionalArguments: PositionalArgument[]) {
    const positionalArgumentNames = this.getPositionalArgumentNames(positionalArguments);
    const getErrorMessage = (duplicates: string[]) => {
      return `${aliasName}: multiple positional arguments has been defined ` +
        `with the same name: [${duplicates}]`;
    };

    DuplicatesValidator.validate(positionalArgumentNames, getErrorMessage);
  }

  private static checkMultipleListPositionalArguments(
    aliasName: string, positionalArguments: PositionalArgument[]
  ) {
    const listPositionalArgumentNames = positionalArguments
      .filter(positionalArgument => PositionalArgumentType.isListType(positionalArgument.type))
      .map(positionalArgument => positionalArgument.name);

    if (listPositionalArgumentNames.length > 1) {
      throw new Error(
        `${aliasName}: only one list type positional argument is allowed, ` +
        `found: [${listPositionalArgumentNames}]`
      );
    }
  }

  private static getPositionalArgumentNames(positionalArguments: PositionalArgument[]): string[] {
    return positionalArguments.map(positionalArgument => positionalArgument.name);
  }
}
