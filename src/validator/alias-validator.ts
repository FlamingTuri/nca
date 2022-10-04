import { Alias } from "../model/alias";
import { AliasOption } from "../model/alias-option";
import { AliasPositionalArgument } from "../model/alias-positional-argument";
import { ArrayUtils } from "../util/array-utils";
import { DuplicatesValidator } from "./duplicates-validator";
import { OptionValidator } from "./option-validator";
import { PositionalArgumentValidator } from "./positional-argument-validator";
import { WhiteSpaceValidator } from "./white-space-validator";

type Parent = {
  options: AliasOption[],
  positionalArguments: AliasPositionalArgument[]
}

export class AliasValidator {

  static validate(aliases: Alias[]) {
    AliasValidator.privateValidator(aliases, {
      options: [],
      positionalArguments: []
    });
  }

  private static privateValidator(aliases: Alias[], parent: Parent) {
    AliasValidator.checkNamesFormat(aliases);
    AliasValidator.checkForDuplicateNames(aliases);

    aliases.forEach(alias => {
      AliasValidator.validateAlias(alias, parent);
    });
  }

  private static checkNamesFormat(aliases: Alias[]) {
    const aliasesNames = aliases.map(alias => alias.name)
    WhiteSpaceValidator.validate(aliasesNames, elementsWithWhitespaces => {
      return `Alias names cannot contain whitespaces [${elementsWithWhitespaces}]`;
    });
  }

  private static checkForDuplicateNames(aliases: Alias[]) {
    const aliasNames = aliases.map(alias => alias.name);
    const getErrorMessage = (duplicates: string[]) => {
      return `Multiple aliases has been defined with the same name: [${duplicates}]`;
    };

    DuplicatesValidator.validate(aliasNames, getErrorMessage);
  }

  private static validateAlias(alias: Alias, parent: Parent) {
    AliasValidator.validateCommand(alias);

    const options = ArrayUtils.concat(parent.options, alias.options);
    OptionValidator.validate(alias.name, options);

    const positionalArguments = ArrayUtils.concat(parent.positionalArguments, alias.positionalArguments);
    PositionalArgumentValidator.validate(alias.name, positionalArguments);

    if (alias.subAliases) {
      AliasValidator.checkSubAliasesAndPositionalArgumentNames(alias, positionalArguments);

      AliasValidator.privateValidator(alias.subAliases, {
        options: options,
        positionalArguments: positionalArguments
      });
    }
  }

  private static validateCommand(alias: Alias) {
    if (!alias.command && (alias.subAliases ?? []).length == 0) {
      throw new Error(`Alias '${alias.name}' must define sub aliases when its command is not defined`);
    }
  }

  private static checkSubAliasesAndPositionalArgumentNames(alias: Alias, parentPositionalArguments: AliasPositionalArgument[]) {
    if (alias.subAliases && alias.positionalArguments) {
      const aliasMatch = alias.subAliases.find(subAlias => {
        return parentPositionalArguments.some(positionalArgument => {
          return positionalArgument.name === subAlias.name
        });
      });
      if (aliasMatch) {
        throw new Error(`Alias name '${aliasMatch.name}' can not be used since a positional argument with the same name already exists`);
      }
    }
  }
}
