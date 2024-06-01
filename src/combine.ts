import path from 'path';
import fs from 'fs';

function sortKeys(json: any) {
    let newJson = {} as any;
    Object.keys(json).sort().forEach(key => {
        newJson[key] = json[key];
    });
    return newJson;
}

function mergeDependencies(originalDepend: any, newDepend: any) {
    if (!newDepend) return;
    for (let key of Object.keys(newDepend)) {
        if (originalDepend[key] == newDepend[key]) continue;
        if (!originalDepend[key]) {
            originalDepend[key] = newDepend[key];
            continue;
        }
        if (originalDepend[key] < newDepend[key]) {
            console.log('Miss ' + key + ":", originalDepend[key], '|', newDepend[key]);
            originalDepend[key] = newDepend[key];
            console.log("└ Will be used version:", originalDepend[key]);
        }
    }
}

async function readFolder(folder: string, packageJson: any, ignoreFirst: boolean) {
    let folders = fs.readdirSync(folder);
    let fp = '';
    let localPackage = {} as any;
    for (let f of folders) {
        fp = path.join(folder, f);
        if (f[0] == '.') continue;
        if (f == 'node_modules') continue;
        if (fs.statSync(fp).isDirectory()) {
            await readFolder(fp, packageJson, false);
            continue;
        }
        if (!ignoreFirst && f == 'package.json') {
            localPackage = fs.readFileSync(fp);
            localPackage = JSON.parse(localPackage.toString());
            mergeDependencies(packageJson.dependencies, localPackage.dependencies);
            mergeDependencies(packageJson.devDependencies, localPackage.devDependencies);
            // console.log(folder + ' -', localPackage);
        }
    }
    packageJson.dependencies = sortKeys(packageJson.dependencies);
    packageJson.devDependencies = sortKeys(packageJson.devDependencies);
}

export async function combine(from: string, to: string) {
    from = path.resolve(process.cwd(), from);
    to = path.resolve(process.cwd(), to);
    if (!to.endsWith(".json")) {
        to = path.join(to, 'package.json');
    }

    let packageJson = {
        "name": "-",
        "description": "-",
        "version": "0.0.0"
    } as any;

    if (!fs.existsSync(to)) {
        fs.mkdirSync(path.dirname(to), { recursive: true });
    }
    if (from.endsWith('.json') || !fs.existsSync(to)) {
        if (!from.endsWith('.json')) {
            from = path.join(from, 'package.json');
        }
        packageJson = JSON.parse(fs.readFileSync(from).toString());
        from = path.dirname(from);
    }
    else packageJson = JSON.parse(fs.readFileSync(to).toString())
    console.log("Package JSON Before", packageJson, '\n');

    if (from.endsWith('.json')) from = path.dirname(from);

    await readFolder(from, packageJson, true);
    console.log("Saving...")
    fs.writeFileSync(to, JSON.stringify(packageJson, undefined, 4));
    console.log("Done");
    // console.log("Package JSON", packageJson);

}