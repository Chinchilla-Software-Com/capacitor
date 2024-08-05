import { Option, program } from 'commander';
import { resolve } from 'path';

import c from './colors';
import { checkExternalConfig, loadConfig } from './config';
import type { Config } from './definitions';
import { fatal, isFatal } from './errors';
import { receive } from './ipc';
import { logger, output } from './log';
import { telemetryAction } from './telemetry';
import { wrapAction } from './util/cli';
import { emoji as _e } from './util/emoji';

type Writable<T> = T extends object
  ? { -readonly [K in keyof T]: Writable<T[K]> }
  : T;

process.on('unhandledRejection', error => {
  console.error(c.failure('[fatal]'), error);
});

process.on('message', receive);

export async function run(): Promise<void> {
  try {
    const config = await loadConfig();
    runProgram(config);
  } catch (e: any) {
    process.exitCode = isFatal(e) ? e.exitCode : 1;
    logger.error(e.message ? e.message : String(e));
  }
}

export function runProgram(config: Config): void {
  program.version(config.cli.package.version);

  program
    .command('build <platform>')
    .description('builds the release version of the selected platform')
    .option('--scheme <schemeToBuild>', 'iOS Scheme to build')
    .option('--flavor <flavorToBuild>', 'Android Flavor to build')
    .option('--keystorepath <keystorePath>', 'Path to the keystore')
    .option('--keystorepass <keystorePass>', 'Password to the keystore')
    .option('--keystorealias <keystoreAlias>', 'Key Alias in the keystore')
    .option('--configuration <name>', 'Configuration name of the iOS Scheme')
    .option(
      '--keystorealiaspass <keystoreAliasPass>',
      'Password for the Key Alias',
    )
    .addOption(
      new Option(
        '--androidreleasetype <androidreleasetype>',
        'Android release type; APK or AAB',
      ).choices(['AAB', 'APK']),
    )
    .addOption(
      new Option(
        '--signing-type <signingtype>',
        'Program used to sign apps (default: jarsigner)',
      ).choices(['apksigner', 'jarsigner']),
    )
    .action(
      wrapAction(
        telemetryAction(
          config,
          async (
            platform,
            {
              scheme,
              flavor,
              keystorepath,
              keystorepass,
              keystorealias,
              keystorealiaspass,
              androidreleasetype,
              signingType,
              configuration,
            },
          ) => {
            const { buildCommand } = await import('./tasks/build');
            await buildCommand(config, platform, {
              scheme,
              flavor,
              keystorepath,
              keystorepass,
              keystorealias,
              keystorealiaspass,
              androidreleasetype,
              signingtype: signingType,
              configuration,
            });
          },
        ),
      ),
    );

  program.arguments('[command]').action(
    wrapAction(async cmd => {
      if (typeof cmd === 'undefined') {
        output.write(
          `\n  ${_e('⚡️', '--')}  ${c.strong(
            'Capacitor - Cross-Platform apps with JavaScript and the Web',
          )}  ${_e('⚡️', '--')}\n\n`,
        );
        program.outputHelp();
      } else {
        fatal(`Unknown command: ${c.input(cmd)}`);
      }
    }),
  );

  program.parse(process.argv);
}
