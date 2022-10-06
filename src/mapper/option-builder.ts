import yargs from "yargs";
import { OptionParam } from "../model/option-param";
import { AnyObj } from "../util/custom-types";

export class OptionBuilder {

  static build<T = AnyObj>(yargs: yargs.Argv<T>, aliasOptions?: OptionParam[]) {
    if (aliasOptions) {
      aliasOptions.forEach(aliasOption => {
        OptionBuilder.mapOption<T>(yargs, aliasOption);
      });
    }
  }

  private static mapOption<T = AnyObj>(yargs: yargs.Argv<T>, aliasOption: OptionParam) {
    yargs.option(aliasOption.name, {
      alias: aliasOption.alternativeName,
      type: aliasOption.optionType,
      default: aliasOption.defaultValue
    });
  }
}
