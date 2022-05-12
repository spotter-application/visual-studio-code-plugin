import { SpotterPlugin, promisedExec, SpotterOption } from '@spotter-app/plugin';
import { homedir } from 'os';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

function getVSCodePath(vscodeEdition = 'code') {
  if (vscodeEdition === 'code-insiders' && existsSync(''.concat(
    '/Library/Application Support',
    '/Code - Insiders',
  ))) {
    return 'Code - Insiders';
  }

  if (vscodeEdition === 'codium' && existsSync(''.concat(
    '/Library/Application Support',
    '/VSCodium',
  ))) {
    return 'VSCodium';
  }

  return 'Code';
}


function getProjectFilePath() {
  const VSCodePath = getVSCodePath();
  const relativeProjectFilePath = join(
    VSCodePath,
    'User',
    'globalStorage',
    'alefragnani.project-manager',
    'projects.json',
  );

  return join(
    homedir(),
    '/Library/Application Support',
    relativeProjectFilePath,
  );
}

interface Project {
  name: string,
  rootPath: string,
  paths: string[],
  tags: string[],
  enabled: boolean
}

new class ApplicationsPlugin extends SpotterPlugin {
  private appPath = '/Applications/Visual Studio Code.app';

  async onInit() {
    const projectsFile = getProjectFilePath();
    const rawData = readFileSync(projectsFile, 'utf-8');
    const projects: Project[] = JSON.parse(rawData);
    const options: SpotterOption[] = projects.map(p => ({
      title: p.name,
      icon: this.appPath,
      onSubmit: () => this.openProject(p.rootPath),
    }));

    this.spotter.setRegisteredOptions([{
      title: 'Visual Studio Code',
      prefix: 'vsc',
      icon: this.appPath,
      replaceOptions: ['Visual Studio Code'],
      onSubmit: this.open,
      onQuery: () => options,
    }]);
  }


  private open() {
    promisedExec(`open "${this.appPath}"`);
  }

  private openProject(path: string) {
    promisedExec(`open -n -b "com.microsoft.VSCode" --args -r "${path}"`);
    return true;
  }
}
